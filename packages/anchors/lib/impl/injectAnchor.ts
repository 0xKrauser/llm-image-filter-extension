import type { CSUI, CSUIAnchor, CSUIMountState } from 'lib/base/types';
import type { createShadowDOM } from './createShadowDom';

type CSUIShadowDOM = Awaited<ReturnType<typeof createShadowDOM>>;

export async function injectAnchor<T>(
  Mount: CSUI<T>,
  anchor: CSUIAnchor,
  { shadowHost, shadowRoot }: CSUIShadowDOM,
  mountState?: CSUIMountState,
) {
  if (typeof Mount.getStyle === 'function') {
    const sfcStyleContent = typeof Mount.getSfcStyleContent === 'function' ? await Mount.getSfcStyleContent() : '';
    shadowRoot.prepend(await Mount.getStyle({ ...anchor, sfcStyleContent }));
  }

  if (typeof Mount.getShadowHostId === 'function') {
    shadowHost.id = await Mount.getShadowHostId(anchor);
  }

  if (typeof Mount.mountShadowHost === 'function') {
    await Mount.mountShadowHost({
      shadowHost,
      anchor,
      mountState,
    });
  } else if (anchor.type === 'inline') {
    anchor.element.insertAdjacentElement(anchor.insertPosition || 'afterend', shadowHost);
  } else {
    document.documentElement.prepend(shadowHost);
  }
}
