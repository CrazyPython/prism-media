const VINT = require('./VINT');

class Tag {
  constructor(id, data) {
    this.id = typeof id === 'string' ? Elements[id] : id;
    this.data = Array.isArray(data) ? data : [data];
  }

  serialize() {
    const serializedData = this.data.map(x => {
      if (x instanceof Tag) {
        return x.serialize();
      } else if (Number.isSafeInteger(x)) {
        const n = Math.ceil((Math.log2(x) || 1) / 8);
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
  'Cluster': [0x1F, 0x43, 0xB6, 0x75],
  'Timecode': [0xE7],
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
};

for (const el in Elements) Elements[el] = Buffer.from(Elements[el]);

module.exports = {
  Tag,
  Elements,
};
