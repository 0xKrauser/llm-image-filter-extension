import type { CSUI, CSUIAnchor, CSUIJSXContainer } from '@extension/anchors';
import { createAnchorObserver, createRender, getLayout } from '@extension/anchors';
import { FilterOverlay } from '@src/FilterOverlay';
import { createRoot } from 'react-dom/client';
import { InlineCSUIContainer } from './InlineCSUIContainer';
import tailwindcssOutput from '../dist/tailwind-output.css?inline';

const regex = /\/status\/(\d+)/;

// Keep track of processed tweets to avoid multiple renders
const processedArticles = new WeakSet<Element>();

const Mount = {
  default: FilterOverlay,
  getInlineAnchorList: async () => {
    const anchors = document.querySelectorAll(`img[src*="pbs.twimg.com/media/"]`);
    return Array.from(anchors)
      .map(element => {
        // Find the article element - this will be the main tweet container
        const article = element.closest('article');
        if (!article) return null;

        // Skip if we've already processed this article
        if (processedArticles.has(article)) return null;

        const linkElement = article
          ?.querySelector(`a[href^="/"][href*="/status/"]:not([href*="/photo/"]):not([href*="/analytics"])`)
          ?.getAttribute('href');
        const match = linkElement?.match(regex);
        const statusId = match?.[1];
        if (!statusId) {
          return null;
        }

        // Mark this article as processed
        processedArticles.add(article);

        // Use the article's first child as the insertion point (to appear before the tweet)
        // This allows us to control the original tweet visibility
        return {
          element: article,
          type: 'inline',
          insertPosition: 'beforebegin', // Insert before the article for better overlay control
          props: {
            statusId,
            article, // Pass the full article element for reference
          },
        } as CSUIAnchor;
      })
      .filter(Boolean) as CSUIAnchor[];
  },
  getStyle: async () => {
    const style = document.createElement('style');
    style.textContent = tailwindcssOutput;
    return style;
  },
} as Partial<CSUI<CSUIJSXContainer>>;

const observer = createAnchorObserver(Mount);

const root = document.createElement('div');
root.id = 'filter-twitter-root';

document.body.append(root);

const render = createRender(Mount, InlineCSUIContainer, observer?.mountState, async (anchor, rootContainer) => {
  const root = createRoot(rootContainer);
  anchor.root = root;

  const Layout = getLayout(Mount);
  root.render(
    <Layout>
      <InlineCSUIContainer anchor={anchor}>
        <Mount.default anchor={anchor} rootContainer={rootContainer} />
      </InlineCSUIContainer>
    </Layout>,
  );
});

if (observer) {
  observer.start(render);
  if (typeof Mount.watch === 'function') {
    Mount.watch({
      observer,
      render,
    });
  }
}
