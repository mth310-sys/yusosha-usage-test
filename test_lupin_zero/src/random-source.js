function normalizeSeed(seed) {
  const value = Number(seed);
  if (!Number.isFinite(value)) return 0x6d2b79f5;
  return (value >>> 0) || 0x6d2b79f5;
}

export class SeededRandomSource {
  constructor(seed = 0x6d2b79f5) {
    this.initialSeed = normalizeSeed(seed);
    this.state = this.initialSeed;
    this.drawCount = 0;
  }

  nextUint32() {
    let t = this.state += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const value = (t ^ (t >>> 14)) >>> 0;
    this.state >>>= 0;
    this.drawCount += 1;
    return value;
  }

  nextFloat() {
    return this.nextUint32() / 4294967296;
  }

  snapshot() {
    return Object.freeze({
      initialSeed: this.initialSeed,
      state: this.state >>> 0,
      drawCount: this.drawCount
    });
  }
}

export class SequenceRandomSource {
  constructor(sequence = []) {
    this.sequence = [...sequence];
    this.index = 0;
  }

  nextFloat() {
    if (this.index >= this.sequence.length) {
      throw new Error('SequenceRandomSource exhausted');
    }
    const value = this.sequence[this.index++];
    if (typeof value !== 'number' || value < 0 || value >= 1) {
      throw new Error('Random sequence values must be >= 0 and < 1');
    }
    return value;
  }

  snapshot() {
    return Object.freeze({ index: this.index, length: this.sequence.length });
  }
}

export function drawPercent(randomSource, percent) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
  if (typeof percent !== 'number' || percent < 0 || percent > 100) {
    throw new RangeError('percent must be between 0 and 100');
  }
  return randomSource.nextFloat() < percent / 100;
}
