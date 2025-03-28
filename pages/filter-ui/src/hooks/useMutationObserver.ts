import { useEffect, useRef } from 'react';

type MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => void;

interface MutationObserverOptions {
  attributes?: boolean;
  childList?: boolean;
  subtree?: boolean;
  attributeFilter?: string[];
  attributeOldValue?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
}

/**
 * Custom hook for observing DOM mutations on a target element
 * @param targetRef React ref to the target element
 * @param callback Function to call when mutations are observed
 * @param options MutationObserver configuration options
 */
export const useMutationObserver = (
  targetRef: React.RefObject<Element>,
  callback: MutationCallback,
  options: MutationObserverOptions = {
    childList: true,
    subtree: true,
  }
): void => {
  // Store the callback in a ref to avoid recreating the observer unnecessarily
  const callbackRef = useRef<MutationCallback>(callback);

  // Update the ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Create a MutationObserver instance
    const observer = new MutationObserver((mutations, obs) => {
      callbackRef.current(mutations, obs);
    });

    // Start observing the target element
    observer.observe(target, options);

    // Clean up function
    return () => {
      observer.disconnect();
    };
  }, [targetRef, options]);
};