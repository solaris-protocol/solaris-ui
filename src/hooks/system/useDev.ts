import { useMemo } from 'react';

import { useQueryParams } from 'hooks/system/useQueryParams';

const KEY = 'dev';

// to clear dev remove it from localStorage
export function useDev() {
  const queryParams = useQueryParams();
  const isQueryDev = queryParams.get(KEY);
  const isStorageDev = localStorage.getItem(KEY);

  return useMemo(() => {
    if (isStorageDev) {
      return Boolean(isStorageDev);
    }

    if (isQueryDev) {
      localStorage.setItem(KEY, '1');
      return Boolean(isQueryDev);
    }

    return false;
  }, [isQueryDev, isStorageDev]);
}
