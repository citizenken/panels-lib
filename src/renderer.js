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

    var script = self.body.join('');
    if (cb) {
      return cb({
        html: {
          script: script
        }
      });
    } else {
      return script;
    }
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

