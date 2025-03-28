import { type RefObject, useEffect, useState } from 'react';

interface IntersectionObserverOptions {
  root?: Element | Document | null; // The viewport element
  rootMargin?: string; // Margin around the root
  threshold?: number | number[]; // Visibility percentage
}

// Define the hook
export const useIntersectionObserver = (
  ref: RefObject<Element>, // React ref to the target element
  options: IntersectionObserverOptions = {},
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentElement = ref.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [ref, options]);

  return isVisible;
};
