import { PhantomWalletAdapter } from 'app/contexts/wallet//wallet-adapters/phantom';
import { LedgerWalletAdapter } from 'app/contexts/wallet/wallet-adapters/ledger';
import { SolanaWalletAdapter } from 'app/contexts/wallet/wallet-adapters/sollet';
import { SolongWalletAdapter } from 'app/contexts/wallet/wallet-adapters/solong';
import ledgerIcon from 'assets/icons/ledger.svg';
import mathwalletIcon from 'assets/icons/mathwallet.svg';
import phantomIcon from 'assets/icons/phantom.png';
import solflareIcon from 'assets/icons/solflare.svg';
import solletIcon from 'assets/icons/sollet.svg';
import solongIcon from 'assets/icons/solong.png';

export const WALLET_PROVIDERS = [
  {
    name: 'Phantom',
    url: 'https://phantom.app/',
    icon: phantomIcon,
    adapter: PhantomWalletAdapter,
  },
  {
    name: 'Solong',
    url: 'https://solongwallet.com',
    icon: solongIcon,
    adapter: SolongWalletAdapter,
  },
  {
    name: 'Sollet Extension',
    url: 'https://chrome.google.com/webstore/detail/sollet/fhmfendgdocmcbmfikdcogofphimnkno',
    icon: solletIcon,
    adapter: SolanaWalletAdapter,
  },
  {
    name: 'Sollet',
    url: 'https://www.sollet.io',
    icon: solletIcon,
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com/access-wallet',
    icon: solflareIcon,
  },
  {
    name: 'Ledger',
    url: 'https://www.ledger.com',
    icon: ledgerIcon,
    adapter: LedgerWalletAdapter,
  },
  {
    name: 'MathWallet',
    url: 'https://mathwallet.org',
    icon: mathwalletIcon,
  },
];
