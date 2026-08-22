import { LUPIN_PRISM_MECHANISM_SPEC } from './mechanism-spec.js';

export class PrismMechanismController {
  constructor(root) {
    if (!(root instanceof Element)) throw new TypeError('mechanism root Element is required');
    this.root = root;
    this.state = LUPIN_PRISM_MECHANISM_SPEC.states.CLOSED;
    this.apply(this.state);
  }

  apply(state) {
    if (!Object.values(LUPIN_PRISM_MECHANISM_SPEC.states).includes(state)) {
      throw new Error(`Unknown mechanism state: ${state}`);
    }
    this.state = state;
    this.root.dataset.state = state.toLowerCase();
    this.root.setAttribute('aria-label', state === 'REVEAL'
      ? 'Observed prism mechanism reveal prototype'
      : 'Observed prism mechanism closed prototype');
    return this.snapshot();
  }

  toggleDebug() {
    return this.apply(this.state === LUPIN_PRISM_MECHANISM_SPEC.states.CLOSED
      ? LUPIN_PRISM_MECHANISM_SPEC.states.REVEAL
      : LUPIN_PRISM_MECHANISM_SPEC.states.CLOSED);
  }

  snapshot() {
    return Object.freeze({
      state: this.state,
      circularElementVisible: this.state === LUPIN_PRISM_MECHANISM_SPEC.states.REVEAL,
      automaticTriggerImplemented: LUPIN_PRISM_MECHANISM_SPEC.policy.automaticTriggerImplemented
    });
  }
}
