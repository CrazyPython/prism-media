function exp(mod) {
  for (const key in mod) {
    module.exports[key] = mod[key];
  }
}

module.exports = {
  opus: require('./transcoders/Opus.js'),
  FFmpeg: require('./transcoders/FFmpeg'),
  OggOpusDemuxer: require('./demuxers/OggOpus'),
  OggOpusMuxer: require('./muxers/OggOpus'),
  WebmOpusDemuxer: require('./demuxers/WebmOpus'),
  WebmVorbisDemuxer: require('./demuxers/WebmVorbis'),
  EBML: require('./util/EBML'),
  VINT: require('./util/VINT'),
  OpusHead: require('./util/OpusHead'),
};

exp(require('./transformers/PCMVolume'));
