import type { FC, ReactNode } from 'react';
import { Fragment } from 'react/jsx-runtime';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLayout = (RawImport: any): FC<{ children: ReactNode }> =>
  typeof RawImport.Layout === 'function'
    ? RawImport.Layout
    : typeof RawImport.getGlobalProvider === 'function'
      ? RawImport.getGlobalProvider()
      : Fragment;
