import type { CSUI, CSUIAnchor, CSUIMountState } from 'lib/base/types';
import { injectAnchor } from './injectAnchor';
import { createShadowDOM } from './createShadowDom';

export async function createShadowContainer<T>(Mount: CSUI<T>, anchor: CSUIAnchor, mountState?: CSUIMountState) {
  const shadowDom = await createShadowDOM(Mount);

  mountState?.hostSet.add(shadowDom.shadowHost);
  mountState?.hostMap.set(shadowDom.shadowHost, anchor);

  await injectAnchor(Mount, anchor, shadowDom, mountState);

  return shadowDom.shadowContainer;
}
