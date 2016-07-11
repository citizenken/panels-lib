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
