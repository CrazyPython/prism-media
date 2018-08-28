class VINT {
  static length(int) {
    let i = 0;
    for (; i < 8; i++) if (int & (1 << (7 - i))) break;
    return i + 1;
  }

  static parse(buffer) {
    const length = VINT.length(buffer[0]);
    if (length > buffer.length) return { length };
    let data = buffer.slice(0, length);
    data[0] &= 0xFF >> length;
    return { length, data };
  }

  static serialize(n) {
    const nBits = Math.ceil(Math.log2(n)) || 1;
    let nBytes = Math.ceil(nBits / 8);
    const nFreeBits = nBits % 8 ? 8 - (nBits % 8) : 0;
    if (nBytes > nFreeBits) nBytes++;
    n |= 1 << (7 * nBytes);
    const buffer = Buffer.alloc(nBytes);
    buffer.writeUIntBE(n, 0, buffer.length);
    return buffer;
  }
}

module.exports = VINT;
