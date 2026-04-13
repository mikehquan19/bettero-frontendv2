'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: 'mui' });

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
      const out = inserted;
      inserted = [];
      return out;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;

    return (
      <style
        dangerouslySetInnerHTML={{
          __html: cache.inserted,
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
