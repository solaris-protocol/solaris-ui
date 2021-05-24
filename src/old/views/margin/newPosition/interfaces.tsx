import { ParsedAccount } from "../../../../app/contexts/accounts";
import { LendingReserve } from "../../../../app/models/lending/reserve";

export interface Token {
  mintAddress: string;
  tokenName: string;
  tokenSymbol: string;
}

export interface Position {
  id?: number | null;
  leverage: number;
  collateral: {
    type?: ParsedAccount<LendingReserve>;
    value?: number | null;
  };
  asset: {
    type?: ParsedAccount<LendingReserve>;
    value?: number | null;
  };
  error?: string;
}
