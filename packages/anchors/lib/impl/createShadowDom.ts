import type { CSUI } from 'lib/base/types';

export async function createShadowDOM<T>(Mount: CSUI<T>) {
  const shadowHost = document.createElement('anchors-csui');
  shadowHost.style.height = '100%';
  shadowHost.style.width = '100%';
  shadowHost.style.position = 'absolute';

  const shadowRoot =
    typeof Mount.createShadowRoot === 'function'
      ? await Mount.createShadowRoot(shadowHost)
      : shadowHost.attachShadow({ mode: 'open' });

  const shadowContainer = document.createElement('div');

  shadowContainer.id = 'anchors-shadow-container';
  shadowContainer.style.zIndex = '88888888';
  shadowContainer.style.position = 'relative';

  shadowRoot.appendChild(shadowContainer);

  return {
    shadowHost,
    shadowRoot,
    shadowContainer,
  };
}
