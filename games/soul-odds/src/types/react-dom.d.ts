// ✦ The app doesn't depend on @types/react-dom, and only `createPortal` is used (the phone wager sheet).
//   Delete this file if the package is ever added.
declare module 'react-dom' {
  import type { ReactNode, ReactPortal } from 'react';

  export function createPortal(
    children: ReactNode,
    container: Element | DocumentFragment,
    key?: string | null,
  ): ReactPortal;
}
