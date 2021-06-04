import SolletWalletAdapter from '@project-serum/sol-wallet-adapter';
import { Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import { notify } from 'utils/notifications';

import { WalletAdapter } from '../../wallet';

export class SolanaWalletAdapter extends EventEmitter implements WalletAdapter {
  private _provider: SolletWalletAdapter;
  private _providerUrl: string;
  private _onProcess: boolean;

  constructor(providerUrl: string) {
    super();
    this._providerUrl = providerUrl;
    this._onProcess = false;
  }

  get publicKey() {
    if (!this._provider) {
      return null;
    }

    return this._provider.publicKey;
  }

  async signTransaction(transaction: Transaction) {
    return (window as any).solong.signTransaction(transaction);
  }

  connect = () => {
    if (this._onProcess) {
      return;
    }

    if ((window as any).solana === undefined) {
      notify({
        message: 'Solana Extension Error',
        description: 'Please install Solana Extension from Chrome ',
      });
      return;
    }

    this._provider = new SolletWalletAdapter((window as any).sollet, this._providerUrl);
    this._provider.on('connect', () => {
      this.emit('connect', this._provider.publicKey);
      this._onProcess = false;
    });
    this._provider.on('disconnect', () => {
      this.emit('disconnect');
      this._onProcess = false;
    });

    this._provider.connect();
  };

  disconnect(): void {
    this._provider.disconnect();
    this.emit('disconnect');
  }
}
