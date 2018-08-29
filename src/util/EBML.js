const VINT = require('./VINT');

class Document {
  constructor(options = {}) {
    this.options = options = Object.assign({
      ebmlVersion: 1,
      ebmlReadVersion: 1,
      ebmlMaxIDLength: 4,
      ebmlMaxSizeLength: 8,
      docType: 'matroska',
      docTypeVersion: 1,
      docTypeReadVersion: 1,
    }, options);

    this.tags = [
      new Tag('EBML', [
        new Tag('EBMLVersion', options.ebmlVersion),
        new Tag('EBMLReadVersion', options.ebmlReadVersion),
        new Tag('EBMLMaxIDLength', options.ebmlMaxIDLength),
        new Tag('EBMLMaxSizeLength', options.ebmlMaxSizeLength),
        new Tag('DocType', options.docType),
        new Tag('DocTypeVersion', options.docTypeVersion),
        new Tag('DocTypeReadVersion', options.docTypeReadVersion),
      ]),
    ];
  }

  serialize() {
    return Buffer.concat(this.tags.map(x => x.serialize()));
  }

  add(tag) {
    this.tags.push(tag);
    return this;
  }

  toJSON() {
    return this.tags.map(x => x.toJSON ? x.toJSON() : x);
  }
}

class Tag {
  constructor(id, data) {
    if (typeof id === 'string') {
      if (!Elements[id]) throw new Error(`'${id}' is not a valid Element ID!`);
      this.id = Elements[id];
    } else {
      this.id = id;
    }
    this.data = Array.isArray(data) ? data : [data];
  }

  add(tag) {
    this.data.push(tag);
    return this;
  }

  serialize() {
    const serializedData = this.data.map(x => {
      if (x instanceof Tag) {
        return x.serialize();
      } else if (Number.isSafeInteger(x)) {
        let n = Math.ceil((Math.log2(x) || 1) / 8);
        if (!isFinite(n)) n = 1;
        const b = Buffer.alloc(n);
        b.writeUIntBE(x, 0, n);
        return b;
      } else if (typeof x === 'string') {
        return Buffer.from(x.split('').map(c => c.charCodeAt(0)));
      }
      return x;
    });
    const sizeVint = VINT.serialize(serializedData.reduce((acc, x) => acc + x.length, 0));
    return Buffer.concat([this.id, sizeVint, ...serializedData]);
  }
}

const Elements = {
  'EBML': [0x1A, 0x45, 0xDF, 0xA3],
  'EBMLVersion': [0x42, 0x86],
  'EBMLReadVersion': [0x42, 0xF7],
  'EBMLMaxIDLength': [0x42, 0xF2],
  'EBMLMaxSizeLength': [0x42, 0xF3],
  'DocType': [0x42, 0x82],
  'DocTypeVersion': [0x42, 0x87],
  'DocTypeReadVersion': [0x42, 0x85],
  'Segment': [0x18, 0x53, 0x80, 0x67],
  'Info': [0x15, 0x49, 0xA9, 0x66],
  'MuxingApp': [0x4D, 0x80],
  'WritingApp': [0x57, 0x41],
  'Duration': [0x44, 0x89],
  'Cluster': [0x1F, 0x43, 0xB6, 0x75],
  'Timecode': [0xE7],
  'TimecodeScale': [0x2A, 0xD7, 0xB1],
  'Tracks': [0x16, 0x54, 0xAE, 0x6B],
  'TrackEntry': [0xAE],
  'TrackNumber': [0xD7],
  'TrackUID': [0x73, 0xC5],
  'TrackType': [0x83],
  'FlagEnabled': [0xB9],
  'FlagDefault': [0x88],
  'FlagForced': [0x55, 0xAA],
  'FlagLacing': [0x9C],
  'MinCache': [0x6D, 0xE7],
  'MaxBlockAdditionID': [0x55, 0xEE],
  'CodecID': [0x86],
  'CodecDecodeAll': [0xAA],
  'SeekPreRoll': [0x56, 0xBB],
  'FlagInterlaced': [0x9A],
  'FieldOrder': [0x9D],
  'PixelWidth': [0xB0],
  'PixelHeight': [0xBA],
  'SamplingFrequency': [0xB5],
  'Channels': [0x9F],
  'SimpleBlock': [0xA3],
  'Audio': [0xE1],
  'BitDepth': [0x62, 0x64],
  'CodecPrivate': [0x63, 0xA2],
  'CodecDelay': [0x56, 0xAA],
};

for (const el in Elements) Elements[el] = Buffer.from(Elements[el]);

module.exports = {
  Tag,
  Elements,
  Document,
  Types: {
    float(n, octets = 4) {
      const buffer = Buffer.alloc(octets);
      buffer.writeFloatBE(n);
      return buffer;
    },
  },
};
