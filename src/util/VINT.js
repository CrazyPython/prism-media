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
    const bitsRequired = Math.ceil(Math.log2(n));
    const vintWidth = Math.ceil(bitsRequired / 8) - 1;
    const buffer = Buffer.alloc(vintWidth + 1);
    n += (0xFF >> (7 - vintWidth)) << bitsRequired;
    for (let i = 0; i < vintWidth; i++) n ^= 1 << (bitsRequired + vintWidth - i);
    buffer.writeUIntBE(n, 0, buffer.length);
    return buffer;
  }
}

module.exports = VINT;
