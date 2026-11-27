import { createContext, useContext } from 'react';
import type Lenis from 'lenis';

export const FelixLenisContext = createContext<Lenis | null>(null);

export function useFelixLenisInstance() {
  return useContext(FelixLenisContext);
}
