import type { CSUI, CSUIJSXContainer, CSUIMountState, CSUIAnchor } from 'lib/base/types';
import { createShadowContainer } from './createShadowContainer';

export const createRender = <T extends CSUIJSXContainer>(
  Mount: CSUI<T>,
  container: T,
  mountState?: CSUIMountState,
  renderFx?: (anchor: CSUIAnchor, rootContainer: Element) => Promise<void>,
) => {
  const createRootContainer = (anchor: CSUIAnchor) =>
    typeof Mount.getRootContainer === 'function'
      ? Mount.getRootContainer({
          anchor,
          mountState,
        })
      : createShadowContainer(Mount, anchor, mountState);

  if (typeof Mount.render === 'function') {
    return (anchor: CSUIAnchor) =>
      Mount.render(
        {
          anchor,
          createRootContainer,
        },
        container,
      );
  }

  return async (anchor: CSUIAnchor) => {
    const rootContainer = await createRootContainer(anchor);
    return renderFx?.(anchor, rootContainer);
  };
};
