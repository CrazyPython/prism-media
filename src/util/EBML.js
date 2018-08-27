const VINT = require('./VINT');

class EBMLTag {
  constructor({ id, data }) {
    this.id = id;
    this.data = Array.isArray(data) ? data : [data];
  }

  serialize() {
    const serializedData = this.data.map(x => {
      if (x instanceof EBMLTag) return x.serialize();
      return x;
    });
    const sizeVint = VINT.serialize(serializedData.reduce((acc, x) => acc + x.length, 0));
    return Buffer.concat([this.id, sizeVint, ...serializedData]);
  }
}

module.exports = EBMLTag;
