const prism = require('../');
const { Document, Tag, Types } = prism.EBML;
const fs = require('fs');

const document = new Document({
  docType: 'webm',
  docTypeVersion: 4,
  docTypeReadVersion: 2,
});

const str = fs.createReadStream('/home/hydrabolt/Downloads/audio.webm')
  .pipe(new prism.WebmOpusDemuxer());

str.on('data', c => addFrame(c));

const segment = new Tag('Segment', [
  new Tag('Info', [
    new Tag('TimecodeScale', 1000000),
    new Tag('MuxingApp', 'amishshahprism'),
    new Tag('WritingApp', 'amishshahprism'),
  ]),
  new Tag('Tracks', [
    new Tag('TrackEntry', [
      new Tag('TrackNumber', 1),
      new Tag('TrackUID', 1),
      new Tag('FlagLacing', 0),
      new Tag('CodecDelay', 6500000),
      new Tag('SeekPreRoll', 80000000),
      new Tag('CodecID', 'A_OPUS'),
      new Tag('TrackType', 2),
      new Tag('Audio', [
        new Tag('Channels', 2),
        new Tag('SamplingFrequency', Types.float(48000)),
        new Tag('BitDepth', 32000),
      ]),
      new Tag('CodecPrivate', prism.OpusHead.serialize()),
    ]),
  ]),
]);

const cluster = new Tag('Cluster', [
  new Tag('Timecode', 0),
]);

let i = 0;
function addFrame(frame) {
  if (i > 1600) return;
  if (i === 1600) {
    segment.add(cluster);
    document.add(segment);
    const out = document.serialize();
    
    /* eslint-disable no-console */
    
    fs.writeFileSync('./test/audio/doc.webm', out);
    i++;
    console.log('written');
    return;
  }
  const buffer = Buffer.alloc(frame.length + 4);
  buffer[0] = 0x81;
  buffer.writeInt16BE(i * 20, 1);
  buffer[3] = 1 << 7;
  frame.copy(buffer, 4);
  const tag = new Tag('SimpleBlock', buffer);
  cluster.add(tag);
  i++;
}

// Then try running `mkvinfo audio/doc.webm`
