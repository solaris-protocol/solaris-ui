import BN from 'bn.js';

export interface LastUpdate {
  /// Last slot when updated
  slot: BN;
  /// True when marked stale, false when slot updated
  stale: boolean;
}
