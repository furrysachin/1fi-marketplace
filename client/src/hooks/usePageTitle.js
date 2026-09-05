import { useEffect } from 'react';

/** Sets a per-page document title; pass null/undefined to keep the default. */
export default function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;
    document.title = title;
  }, [title]);
}