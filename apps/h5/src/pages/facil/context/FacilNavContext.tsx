import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type FacilNavContextValue = {
  sidemenuOpen: boolean;
  openSidemenu: () => void;
  closeSidemenu: () => void;
  toggleSidemenu: () => void;
};

const FacilNavContext = createContext<FacilNavContextValue | null>(null);

export function FacilNavProvider({ children }: { children: ReactNode }) {
  const [sidemenuOpen, setSidemenuOpen] = useState(false);

  const openSidemenu = useCallback(() => setSidemenuOpen(true), []);
  const closeSidemenu = useCallback(() => setSidemenuOpen(false), []);
  const toggleSidemenu = useCallback(() => setSidemenuOpen((v) => !v), []);

  const value = useMemo(
    () => ({ sidemenuOpen, openSidemenu, closeSidemenu, toggleSidemenu }),
    [sidemenuOpen, openSidemenu, closeSidemenu, toggleSidemenu],
  );

  return <FacilNavContext.Provider value={value}>{children}</FacilNavContext.Provider>;
}

export function useFacilNav() {
  const ctx = useContext(FacilNavContext);
  if (!ctx) throw new Error('useFacilNav must be used within FacilNavProvider');
  return ctx;
}
