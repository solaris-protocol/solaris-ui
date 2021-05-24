import { TokenAccount } from "../app/models";
import { useAccountsContext } from "../app/contexts/accounts";

export function useUserAccounts() {
  const context = useAccountsContext();
  return {
    userAccounts: context.userAccounts as TokenAccount[],
  };
}
