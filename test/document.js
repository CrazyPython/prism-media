const prism = require('../');
const { Tag } = prism.EBML;
const fs = require('fs');

const document = new Tag('EBML', [
  new Tag('EBMLVersion', 1),
  new Tag('EBMLReadVersion', 1),
  new Tag('EBMLMaxIDLength', 4),
  new Tag('EBMLMaxSizeLength', 8),
  new Tag('DocType', 'webm'),
  new Tag('DocTypeVersion', 4),
  new Tag('DocTypeReadVersion', 2),
]);

const out = document.serialize();

/* eslint-disable no-console */
console.log(out);

fs.writeFileSync('./test/audio/doc.webm', out);

// Then try running `mkvinfo audio/doc.webm`
