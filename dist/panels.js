var comicbook = {
    elements: {
        sceneHeading: {
            strategy: 'regex',
            regex: '(page|PAGE|Page).*(\\([0-9A-Za-z]+ (panels|PANELS)\\))?',
            element: 'h2'
        },
        panel: {
            strategy: 'regex',
            regex: '.*?[pP]anel [0-9]+(\\.|:)',
            element: 'strong',
            subElements: {
                action: '.*'
            }
        },
        character: {
            strategy: 'regex',
            regex: '(([0-9]+ )?.* ?([0-9]+|\\([A-Z]+\\))?:)',
            element: 'td',
            subElements: {
                paren: '( ?\\([A-Z]+\\))?',
                dialogue: '.*'
            }
        },
        dialogue: {
            strategy: 'preceeding',
            preceeding: 'character',
            element: 'p'
        },
        action: {
            strategy: 'preceeding',
            preceeding: 'panel',
            element: 'p'
        }
    },
    defaultElement: 'action'
};

var panelsConfig = {
    comicbook: comicbook
};
var ScriptElement = window.ScriptElement;

function Parser(config) {
this.config = config;
}

Parser.prototype.parseLine = function(line, elements) {
    var element, elementConfig, elementConfigs, key, subLine;
    elementConfigs = this.config.elements;
    element = null;
    for (key in elementConfigs) { // jshint ignore:line
      elementConfig = elementConfigs[key];
      if (elementConfig.strategy === 'regex') {
        element = this.parseElementViaRegex(line, key, elementConfig);
      } else if (elementConfig.strategy === 'preceeding') {
        element = this.parseElementViaPreceeding(line, key, elementConfig, elements);
      }
      if (element) {
        if (elementConfig.subElements) {
          subLine = line.replace(element.text, '');
          element.subElements = this.parseSubElements(subLine, elementConfig.subElements);
        }
        break;
      }
    }
    if (!element) {
      element = new ScriptElement(line, this.config.defaultElement);
    }
    return element;
};

Parser.prototype.parseElementViaRegex = function(line, elType, elementConfig) {
    var re, reMatch;
    re = new RegExp(elementConfig.regex);
    reMatch = line.match(re);
    if (reMatch && reMatch[0] !== '') {
      return new ScriptElement(reMatch[0], elType);
    }
};

Parser.prototype.parseElementViaPreceeding = function(line, elType, elementConfig, elements) {
    var preceedingEl;
    preceedingEl = elements[elements.length - 1];
    if (preceedingEl && preceedingEl.type === elementConfig.preceeding) {
      return new ScriptElement(line, elType);
    }
};

Parser.prototype.parseSubElements = function(subLine, subElConf) {
    var element, re, subEl, subElements, subMatch, subRe;
    subElements = [];
    for (element in subElConf) { // jshint ignore:line
      subRe = subElConf[element];
      re = new RegExp(subRe);
      subMatch = subLine.match(re);
      if (subMatch && subMatch[0] !== '') {
        subEl = new ScriptElement(subMatch[0], element, {
          isSubElement: true
        });
        subElements.push(subEl);
        subLine = subLine.replace(subMatch[0], '');
      }
    }
    return subElements;
};

var $ = window.jQuery;

function Renderer(script, rootElement) {
    this.script = script;
    this.rootElement = rootElement;
    this.body = [];
}

Renderer.prototype.generateHTML = function(element, raw) {
    var el, htmlEl, htmlSubEl, j, lastEl, len, ref, self, subEl, subTag, table, tag, tr;
    self = this;
    el = element;
    tag = this.script.config.elements[element.type].element;

    htmlEl = $('<' + tag + '>', {
      id: el.id,
      'class': el.type,
      html: el.text
    });

    if (tag === 'td') {
      lastEl = $(self.body[self.body.length - 1]);
      if (lastEl.get(0).tagName !== 'TABLE') {
        table = $('<table>');
      } else {
        this.body.pop();
        table = lastEl;
      }
      tr = $('<tr>').append(htmlEl);
      table.append(tr);
      htmlEl = table;
    }

    if (element.subElements) {
      ref = element.subElements;
      for (j = 0, len = ref.length; j < len; j++) {
        subEl = ref[j];

        if (tag === 'td') {
          subTag = 'td';
        } else {
          subTag = 'span';
        }

        htmlSubEl = $('<' + subTag + '>', {
          id: subEl.id,
          'class': subEl.type,
          html: subEl.text
        });

        if (subTag === 'td') {
          tr.append(htmlSubEl);
        } else {
          htmlEl.append(htmlSubEl);
        }
      }
    }

    if (raw) {
      return htmlEl[0].outerHTML;
    } else {
      return htmlEl;
    }
};

Renderer.prototype.renderElements = function(cb) {
    var elements, i, self;
    self = this;
    elements = self.script.elements;
    i = 0;
    while (i < elements.length) {
      if (!elements[i].isSubElement) {
        self.body.push(self.generateHTML(elements[i], true));
      }
      i++;
    }
    return cb({
      html: {
        script: self.body.join('')
      }
    });
};

Renderer.prototype.renderElement = function(element) {
    var htmlEl, self;
    self = this;
    htmlEl = this.generateHTML(element);
    self.body.push(htmlEl);
    return self.rootElement.append(htmlEl);
};

Renderer.prototype.removeElements = function(elements) {
    var i, results, self;
    self = this;
    i = 0;
    results = [];
    while (i < elements.length) {
      results.push(self.removeElement(elements[i]));
    }
    return results;
    };

    Renderer.prototype.removeElement = function(element) {
    return $('#' + element.id).remove();
};


var config = window.panelsConfig,
    Parser = window.Parser,
    _ = window.lodash;

function Script(configSection) {
    this.config = null;
    this.elements = [];
    this.elementGroups = {};
    this.parser = null;
    this.loadConfig(configSection);
}

Script.prototype.loadConfig = function(configSection) {
    this.config = config[configSection];
    this.parser = new Parser(this.config);
};

Script.prototype.fromBlob = function(blob) {
    var element, i, j, len, line, lines, ref;
    lines = blob.split('\n');
    i = 0;
    while (i < lines.length) {
      line = lines[i];
      if (line !== '') {
        element = this.parser.parseLine(line, this.elements);
        if (element) {
          this.addElementToList(element);
          if (element.subElements) {
            ref = element.subElements;
            for (j = 0, len = ref.length; j < len; j++) {
              element = ref[j];
              this.addElementToList(element);
            }
          }
        }
      }
      i++;
    }
    return this.elements;
};

Script.prototype.addElementToList = function(element) {
    element.id = element.type + '_' + this.elements.length;
    this.elements.push(element);
    if (!_.isArray(this.elementGroups[element.type])) {
      this.elementGroups[element.type] = [];
    }
    return this.elementGroups[element.type].push(element);
};
function ScriptElement(text, type, properties) {
    var key;
    this.text = text;
    this.type = type;
    this.id = null;
    this.subElements = null;
    this.isSubElement = false;
    for (key in properties) { // jshint ignore:line
      this[key] = properties[key];
    }
}

ScriptElement.prototype.getElementProperty = function(property) {
    return this[property];
};