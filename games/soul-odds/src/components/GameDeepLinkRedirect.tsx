'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { useAppStore } from '@/services/store/store';
import { redirectToScreenFromCode } from '@/utils/redirectToScreenFromCode';

export const GameDeepLinkRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const setScreen = useAppStore((state) => state.setScreen);

  useEffect(() => {
    const code = pathname.replace(/^\/game\/?/, '');
    redirectToScreenFromCode(code, setScreen);
    router.push('/');
  }, [pathname, router, setScreen]);

  return null;
};
