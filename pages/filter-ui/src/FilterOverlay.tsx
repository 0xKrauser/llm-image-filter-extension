import type { CSUIAnchor } from '@extension/anchors';
import { useRef, useState, useEffect } from 'react';
import { type Tag, type Tweet, tweetStorage } from '@extension/storage';

type ShowableTweet = Tweet & {
  shown?: boolean;
};

export function FilterOverlay({ anchor }: { anchor?: CSUIAnchor; rootContainer?: Element | null }) {
  const { statusId } = (anchor?.props as { statusId: string; article: Element }) || {
    statusId: '',
  };

  const [tweet, setTweet] = useState<ShowableTweet | undefined>();
  const [showContent, setShowContent] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<Element | null>(anchor?.props?.article instanceof Element ? anchor?.props?.article : null);

  const isFiltered =
    tweet?.tags?.some(el => el.some(tag => tag.id === 'ghibli-style' && tag.value === true)) ||
    tweet?.tags?.some(el => el.some(tag => tag.id === 'definitely-ai-generated' && tag.value === true));

  useEffect(() => {
    if (!articleRef.current) return;

    if (isFiltered && !showContent) {
      articleRef.current.setAttribute(
        'style',
        'opacity: 0.1; filter: blur(8px); transition: all 0.3s ease; height: 100px; overflow: hidden;',
      );

      const parent = articleRef.current.parentElement;
      if (parent) {
        parent.style.position = 'relative';
      }
    } else {
      articleRef.current.removeAttribute('style');

      const parent = articleRef.current.parentElement;
      if (parent) {
        parent.style.position = '';
      }
    }
  }, [isFiltered, showContent]);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!statusId || isInitializedRef.current) return;

    isInitializedRef.current = true;

    const extractTweetContent = async (articleElement: Element) => {
      const tweetTextElement = articleElement.querySelector('[data-testid="tweetText"]');
      const tweetText = tweetTextElement?.textContent || '';

      let imageElements: HTMLImageElement[] = [];

      const imageContainers = articleElement.querySelectorAll(
        '[data-testid="tweetPhoto"], [data-testid="tweetImageContainer"]',
      );
      if (imageContainers.length > 0) {
        imageElements = Array.from(imageContainers)
          .map(container => {
            const img = container.querySelector('img');
            return (img as HTMLImageElement) || null;
          })
          .filter(Boolean) as HTMLImageElement[];
      } else {
        const imgElements = articleElement.querySelectorAll('img[src*="pbs.twimg.com/media/"]');
        imageElements = Array.from(imgElements).filter(Boolean) as HTMLImageElement[];
      }

      const limitedImageElements = imageElements.slice(0, 4);

      const images = limitedImageElements.map(img => img.src);

      return { text: tweetText, images };
    };

    const processTagging = async (currentTweet: ShowableTweet) => {
      const length = currentTweet.tweetContent?.images.length || 0;
      if (length < 1) {
        return currentTweet;
      }
      try {
        const response = await fetch('https://smart-filter-api.vercel.app/api/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '21a5bf930fa9a3e25c6abbc497087fb5',
          },
          body: JSON.stringify({
            statusId,
            textContent: '',
            images: currentTweet.tweetContent?.images || [],
            tags: ['ghibli-style', 'possible-ai-generated', 'definitely-ai-generated'],
          }),
        })
          .then(res => res.json())
          .then(data => {
            return data.result as Tag[][];
          });

        if (response.length > 0) {
          const taggedTweet: Tweet = {
            ...currentTweet,
            tagged: true,
            tags: response,
          };
          return taggedTweet;
        }
        return currentTweet;
      } catch (error) {
        console.error('Error fetching tag suggestions:', error);
        return currentTweet;
      }
    };

    const loadContent = async () => {
      let localTweet = await tweetStorage.getTweet(statusId);

      if (!localTweet) {
        localTweet = { statusId, extracted: false, tagged: false, createdAt: Date.now() };
      }

      const article = anchor?.element?.closest('article');
      if (!article) return;

      try {
        const content = await extractTweetContent(article);

        const extractedTweet = {
          ...localTweet,
          statusId,
          extracted: true,
          tweetContent: content,
        };

        await tweetStorage.setTweet(statusId, extractedTweet);
        localTweet = extractedTweet;
      } catch (error) {
        console.error('Error extracting tweet content:', error);
        const errorTweet = {
          extracted: false,
          ...localTweet,
          statusId,
        };
        await tweetStorage.setTweet(statusId, errorTweet);
        localTweet = errorTweet;
      }

      if (localTweet.extracted && !localTweet.tagged) {
        const tweet = await processTagging(localTweet);
        if (tweet) {
          await tweetStorage.setTweet(statusId, tweet);
          localTweet = tweet;
        }
      }

      setTweet(localTweet);
    };

    loadContent();

  }, [statusId, anchor?.element]);

  const handleShowContent = () => {
    setShowContent(true);
  };

  if (!isFiltered || showContent) {
    return <div ref={elementRef} className="invisible size-0"></div>;
  }

  // Apply overlay for controversial content using Tailwind CSS
  return (
    <div ref={elementRef} className="z-10 h-[100px] max-h-full w-full overflow-hidden bg-[#15202b]">
      <div className="flex h-full items-center justify-between p-4">
        <div className="text-center text-lg font-semibold text-white/50">This tweet was ghiblified</div>
        <button
          onClick={handleShowContent}
          className="rounded-full bg-white px-5 py-2 font-bold text-black transition-colors duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          Show content anyway
        </button>
      </div>
    </div>
  );
}
