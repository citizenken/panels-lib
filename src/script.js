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
    console.log(lines);
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