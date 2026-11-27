import { createContext, useContext, type RefObject } from 'react';

export const HelioScrollCtx = createContext<RefObject<HTMLElement | null> | null>(null);

export function useHelioScrollRef() {
  return useContext(HelioScrollCtx);
}
