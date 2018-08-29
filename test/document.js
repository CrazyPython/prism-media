const prism = require('../');
const { Document, Tag, Types } = prism.EBML;
const fs = require('fs');

const document = new Document({
  docType: 'webm',
  docTypeVersion: 4,
  docTypeReadVersion: 2,
});

fs.createReadStream('/home/hydrabolt/Downloads/audio.webm')
  .pipe(new prism.WebmOpusDemuxer())
  .pipe(fs.createWriteStream('/tmp/o'));

const segment = new Tag('Segment', [
  new Tag('Info', [
    new Tag('TimecodeScale', 1000000),
    new Tag('MuxingApp', 'amishshahprism'),
    new Tag('WritingApp', 'amishshahprism'),
    new Tag('Duration', Types.float(1000)),
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
        new Tag('SamplingFrequency', Types.float(48)),
        new Tag('BitDepth', 16000),
      ]),
      new Tag('CodecPrivate', Buffer.from([
        0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, 0x01, 0x02, 0x38, 0x01, 0x80, 0xBB, 0, 0, 0, 0, 0,
      ])),
    ]),
  ]),
]);

const cluster = new Tag('Cluster', [
  new Tag('Timecode', 0),
]);
for (let i = 0; i < 100; i++) {
  const frame = fs.readFileSync(`./test/audio/chunks/Chunk${i}.raw`);
  const buffer = Buffer.alloc(frame.length + 4);
  buffer[0] = 0x81;
  buffer.writeInt16BE(i * 20, 1);
  buffer[3] = 1 << 7;
  frame.copy(buffer, 4);
  const tag = new Tag('SimpleBlock', buffer);
  cluster.add(tag);
}

segment.add(cluster);
document.add(segment);

const out = document.serialize();

/* eslint-disable no-console */
console.log(out);

fs.writeFileSync('./test/audio/doc.webm', out);

// Then try running `mkvinfo audio/doc.webm`
