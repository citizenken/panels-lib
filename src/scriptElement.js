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