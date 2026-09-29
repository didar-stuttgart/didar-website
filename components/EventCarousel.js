import React, { useRef, useState, useEffect } from 'react';
import EventCard from './EventCard';
import { t } from '@/lib/i18n';

/**
 * EventCarousel Component
 * Displays events in a horizontal scrolling carousel with navigation arrows
 * Uses explicit scrollLeft calculation to reliably handle RTL mode
 */
export default function EventCarousel({ events, currentLang, isPast = false }) {
  const scrollContainerRef = useRef(null);
  const cardsRef = useRef([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const isRTL = currentLang === 'fa';

  // Check scroll position on mount and whenever events change
  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (!container) return;

    // Re-check scroll state on window resize
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [events, isRTL]);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const maxScroll = Math.abs(container.scrollWidth - container.clientWidth);
    const currentScroll = Math.abs(container.scrollLeft);

    if (isRTL) {
      // In RTL, scrollLeft is typically negative, so we work with absolute values
      setCanScrollLeft(currentScroll > 10);
      setCanScrollRight(currentScroll < maxScroll - 10);
    } else {
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(container.scrollLeft < maxScroll - 10);
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container || cardsRef.current.length === 0) return;

    // Estimate how many cards fit in viewport
    const cardWidth = cardsRef.current[0]?.offsetWidth || 320;
    const containerWidth = container.clientWidth;
    const cardsPerView = Math.floor(containerWidth / cardWidth) || 1;

    // NOTE: .event-carousel forces CSS 'direction: ltr' on the scroll
    // track itself (see styles/components.css) so that scrollLeft math
    // stays reliable in both languages. That means cards are always laid
    // out left-to-right in the track regardless of currentLang/isRTL, so
    // the index math must be identical for FA and DE: 'left' always
    // steps to an earlier (physically-left) card and 'right' always
    // steps to a later (physically-right) card. Branching this on isRTL
    // (as a previous version did) inverted the two arrows for Persian.
    let nextIndex = currentCardIndex;
    if (direction === 'left') {
      nextIndex = Math.max(currentCardIndex - cardsPerView, 0);
    } else {
      nextIndex = Math.min(currentCardIndex + cardsPerView, cardsRef.current.length - 1);
    }

    const targetCard = cardsRef.current[nextIndex];
    if (targetCard) {
      // Use scrollIntoView for browser-native, reliable scrolling.
      // The track is always LTR internally (see note above), so 'start'
      // is correct for both languages.
      targetCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });

      setCurrentCardIndex(nextIndex);
      setTimeout(updateScrollState, 600);
    }
  };

  const handleScroll = () => {
    updateScrollState();
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="event-carousel-wrapper">
      <button
        className={`carousel-arrow carousel-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          scroll('left');
        }}
        disabled={!canScrollLeft}
        aria-label={currentLang === 'fa' ? 'رفتن به چپ' : 'Nach links scrollen'}
        title={currentLang === 'fa' ? 'رفتن به چپ' : 'Nach links scrollen'}
      >
        ‹
      </button>

      <div
        className="event-carousel"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        role="region"
        aria-label={currentLang === 'fa' ? 'رویدادها' : 'Veranstaltungen'}
      >
        {events.map((event, idx) => (
          <div
            key={event.id}
            ref={(el) => {
              if (el) cardsRef.current[idx] = el;
            }}
          >
            <EventCard
              event={event}
              currentLang={currentLang}
              isPast={isPast}
            />
          </div>
        ))}
      </div>

      <button
        className={`carousel-arrow carousel-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          scroll('right');
        }}
        disabled={!canScrollRight}
        aria-label={currentLang === 'fa' ? 'رفتن به راست' : 'Nach rechts scrollen'}
        title={currentLang === 'fa' ? 'رفتن به راست' : 'Nach rechts scrollen'}
      >
        ›
      </button>
    </div>
  );
}
