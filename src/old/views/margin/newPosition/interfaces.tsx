import { ParsedAccount } from '../../../../app/contexts/accounts';
import { Reserve } from '../../../../app/models/lending/reserve';

export interface Token {
  mintAddress: string;
  tokenName: string;
  tokenSymbol: string;
}

export interface Position {
  id?: number | null;
  leverage: number;
  collateral: {
    type?: ParsedAccount<Reserve>;
    value?: number | null;
  };
  asset: {
    type?: ParsedAccount<Reserve>;
    value?: number | null;
  };
  error?: string;
}
