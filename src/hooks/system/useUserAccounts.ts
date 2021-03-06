import { useAccountsContext } from 'app/contexts/accounts/accounts';
import { TokenAccount } from 'app/models';

export function useUserAccounts() {
  const context = useAccountsContext();
  return {
    userAccounts: context.userAccounts as TokenAccount[],
  };
}
