export class ManualClockSource {
  constructor(startMs = 0) {
    if (!Number.isFinite(startMs)) throw new TypeError('startMs must be finite');
    this.currentMs = Number(startMs);
  }

  now() {
    return this.currentMs;
  }

  advance(ms) {
    if (!Number.isFinite(ms) || ms < 0) throw new RangeError('ms must be a non-negative finite number');
    this.currentMs += Number(ms);
    return this.currentMs;
  }

  snapshot() {
    return Object.freeze({ nowMs: this.currentMs });
  }
}

export class MonotonicClockSource {
  now() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    throw new Error('MonotonicClockSource requires performance.now()');
  }
}

export const CLOCK_POLICY = Object.freeze({
  kernelUsesWallClockDirectly: false,
  allowedKernelClock: 'INJECTED_CLOCK_SOURCE_ONLY',
  presentationMayUseMonotonicClock: true,
  deterministicTestsUseManualClock: true
});
