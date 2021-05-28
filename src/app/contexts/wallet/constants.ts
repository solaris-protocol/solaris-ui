import { LedgerWalletAdapter } from 'app/contexts/wallet/wallet-adapters/ledger';
import { SolongWalletAdapter } from 'app/contexts/wallet/wallet-adapters/solong';
import ledgerIcon from 'assets/icons/ledger.svg';
import mathwalletIcon from 'assets/icons/mathwallet.svg';
import solflareIcon from 'assets/icons/solflare.svg';
import solletIcon from 'assets/icons/sollet.svg';
import solongIcon from 'assets/icons/solong.png';

export const WALLET_PROVIDERS = [
  {
    name: 'Sollet',
    url: 'https://www.sollet.io',
    icon: solletIcon,
  },
  {
    name: 'Solong',
    url: 'https://solongwallet.com',
    icon: solongIcon,
    adapter: SolongWalletAdapter,
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com/access-wallet',
    icon: solflareIcon,
  },
  {
    name: 'MathWallet',
    url: 'https://mathwallet.org',
    icon: mathwalletIcon,
  },
  {
    name: 'Ledger',
    url: 'https://www.ledger.com',
    icon: ledgerIcon,
    adapter: LedgerWalletAdapter,
  },
];
