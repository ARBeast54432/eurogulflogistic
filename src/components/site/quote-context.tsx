import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { QuoteFormDialog } from "./QuoteFormDialog";

type QuoteContextValue = { openQuote: (serviceSlug?: string | null) => void };

const QuoteContext = createContext<QuoteContextValue>({ openQuote: () => {} });

export function useQuote() {
  return useContext(QuoteContext);
}

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string | null>(null);

  const openQuote = useCallback((serviceSlug?: string | null) => {
    setPreset(serviceSlug ?? null);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openQuote }), [openQuote]);

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <QuoteFormDialog open={open} onOpenChange={setOpen} presetService={preset} />
    </QuoteContext.Provider>
  );
}
