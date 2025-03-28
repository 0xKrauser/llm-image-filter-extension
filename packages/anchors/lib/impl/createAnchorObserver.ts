import type { CSUI, CSUIAnchor, CSUIMountState } from 'lib/base/types';

export function createAnchorObserver<T>(Mount: CSUI<T>) {
  const mountState: CSUIMountState = {
    document: document || window.document,
    observer: null,
    mountInterval: null,
    isMounting: false,
    isMutated: false,
    hostSet: new Set(),
    hostMap: new WeakMap(),
    overlayTargetList: [],
  };

  const isMounted = (el: Element | null) =>
    el?.id ? !!document.getElementById(el.id) : el?.getRootNode({ composed: true }) === mountState.document;

  const hasInlineAnchor = typeof Mount.getInlineAnchor === 'function';

  const hasInlineAnchorList = typeof Mount.getInlineAnchorList === 'function';

  const shouldObserve = hasInlineAnchor || hasInlineAnchorList;

  if (!shouldObserve) {
    return null;
  }

  async function mountAnchors(render: (anchor?: CSUIAnchor) => void) {
    mountState.isMounting = true;

    const mountedInlineAnchorSet = new WeakSet();

    // Go through mounted sets and check if they are still mounted
    for (const el of mountState.hostSet) {
      if (isMounted(el)) {
        const anchor = mountState.hostMap.get(el);
        if (anchor) {
          if (anchor.type === 'inline') {
            mountedInlineAnchorSet.add(anchor.element);
          }
        }
      } else {
        const anchor = mountState.hostMap.get(el);
        anchor?.root?.unmount();
        mountState.hostSet.delete(el);
      }
    }

    const [inlineAnchor, inlineAnchorList] = await Promise.all([
      hasInlineAnchor ? Mount.getInlineAnchor() : null,
      hasInlineAnchorList ? Mount.getInlineAnchorList() : null,
    ]);

    const renderList: CSUIAnchor[] = [];

    if (inlineAnchor) {
      if (inlineAnchor instanceof Element) {
        if (!mountedInlineAnchorSet.has(inlineAnchor)) {
          renderList.push({
            element: inlineAnchor,
            type: 'inline',
          });
        }
      } else if (inlineAnchor.element instanceof Element && !mountedInlineAnchorSet.has(inlineAnchor.element)) {
        renderList.push({
          element: inlineAnchor.element,
          type: 'inline',
          insertPosition: inlineAnchor.insertPosition,
        });
      }
    }

    if (inlineAnchorList && inlineAnchorList?.length > 0) {
      const nodeList =
        inlineAnchorList instanceof NodeList
          ? Array.from(inlineAnchorList).map(el => ({
              element: el as Element,
              insertPosition: 'afterend' as const,
            }))
          : inlineAnchorList;
      nodeList.forEach(inlineAnchor => {
        if (inlineAnchor instanceof Element && !mountedInlineAnchorSet.has(inlineAnchor)) {
          renderList.push({
            element: inlineAnchor,
            type: 'inline',
          });
        } else if (inlineAnchor.element instanceof Element && !mountedInlineAnchorSet.has(inlineAnchor.element)) {
          renderList.push({
            element: inlineAnchor.element,
            type: 'inline',
            insertPosition: inlineAnchor.insertPosition,
            props: (inlineAnchor as CSUIAnchor).props,
          });
        }
      });
    }

    await Promise.all(renderList.map(render));

    if (mountState.isMutated) {
      mountState.isMutated = false;
      await mountAnchors(render);
    }

    mountState.isMounting = false;
  }

  const start = (render: (anchor?: CSUIAnchor) => void) => {
    mountState.observer = new MutationObserver(() => {
      if (mountState.isMounting) {
        mountState.isMutated = true;
        return;
      }
      mountAnchors(render);
    });

    // Need to watch the subtree for shadowDOM
    mountState.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    mountState.mountInterval = setInterval(() => {
      if (mountState.isMounting) {
        mountState.isMutated = true;
        return;
      }
      mountAnchors(render);
    }, 5000);
  };

  return {
    start,
    mountState,
  };
}
