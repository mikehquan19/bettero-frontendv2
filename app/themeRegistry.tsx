'use client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui', prepend: true });
    cache.compat = true;

    let inserted: string[] = [];

    const prevInsert = cache.insert;

    cache.insert = (...args: any) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert.apply(cache, args);
    };

    const flush = () => {
      const styles = inserted.map((name) => cache.inserted[name]).join('');

      inserted = [];
      return styles;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const css = flush();
    if (!css) return null;

    return (
      <style
        dangerouslySetInnerHTML={{
          __html: css,
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
