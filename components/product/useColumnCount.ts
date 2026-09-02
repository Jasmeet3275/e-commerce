"use client";

import { useEffect, useState } from "react";

// @tanstack/react-virtual virtualizes rows, not individual cards, so the grid
// needs a JS-known column count (not a pure CSS auto-fill grid) — otherwise
// the virtualizer's row math and the actual visual layout can drift apart.
const BREAKPOINTS = [
  { query: "(min-width: 1024px)", columns: 4 },
  { query: "(min-width: 640px)", columns: 3 },
] as const;
const DEFAULT_COLUMNS = 2;

export function useColumnCount(): number {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  useEffect(() => {
    const mediaQueries = BREAKPOINTS.map((breakpoint) => ({
      breakpoint,
      mql: window.matchMedia(breakpoint.query),
    }));

    function updateColumns() {
      const match = mediaQueries.find(({ mql }) => mql.matches);
      setColumns(match?.breakpoint.columns ?? DEFAULT_COLUMNS);
    }

    updateColumns();
    mediaQueries.forEach(({ mql }) => mql.addEventListener("change", updateColumns));
    return () =>
      mediaQueries.forEach(({ mql }) => mql.removeEventListener("change", updateColumns));
  }, []);

  return columns;
}
