const OPUS_HEAD = Buffer.from([...'OpusHead'].map(x => x.charCodeAt(0)));

module.exports = {
  serialize(options = {}) {
    options = Object.assign({
      version: 1,
      outputChannelCount: 2,
      preSkip: 312,
      inputSampleRate: 48000,
      outputGain: 0,
      // no support for channel mapping
    });
    const buffer = Buffer.alloc(19);
    OPUS_HEAD.copy(buffer);
    buffer.writeUInt8(options.version, 8);
    buffer.writeUInt8(options.outputChannelCount, 9);
    buffer.writeUInt16LE(options.preSkip, 10);
    buffer.writeUInt32LE(options.inputSampleRate, 12);
    buffer.writeUInt16LE(options.outputGain, 16);
    console.log(buffer);
    return buffer;
  },
  parse(buffer) {
    if (!buffer.slice(0, 8).equals(OPUS_HEAD)) throw new Error('Buffer does not start with OpusHead');
    return {
      version: buffer.readUInt8(9),
      outputChannelCount: buffer.readUInt8(10),
      preSkip: buffer.readUInt16LE(11),
      inputSampleRate: buffer.readUInt32LE(13),
      outputGain: buffer.readUInt16LE(17),
    };
  },
};
