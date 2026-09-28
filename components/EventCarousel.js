import React, { useRef, useState, useEffect } from 'react';
import EventCard from './EventCard';
import { t } from '@/lib/i18n';

/**
 * EventCarousel Component
 * Displays events in a horizontal scrolling carousel with navigation arrows
 * Uses scrollIntoView for arrow navigation to work around RTL scroll limitations
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
  }, [events]);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const maxScroll = Math.abs(container.scrollWidth - container.clientWidth);
    const currentScroll = Math.abs(container.scrollLeft);
    
    if (isRTL) {
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

    let nextIndex = currentCardIndex;
    if (isRTL) {
      // In RTL: direction is reversed for user intuition
      if (direction === 'left') {
        nextIndex = Math.min(currentCardIndex + cardsPerView, cardsRef.current.length - 1);
      } else {
        nextIndex = Math.max(currentCardIndex - cardsPerView, 0);
      }
    } else {
      if (direction === 'left') {
        nextIndex = Math.max(currentCardIndex - cardsPerView, 0);
      } else {
        nextIndex = Math.min(currentCardIndex + cardsPerView, cardsRef.current.length - 1);
      }
    }

    const targetCard = cardsRef.current[nextIndex];
    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: isRTL ? 'end' : 'start'
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
        onClick={() => scroll('left')}
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
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        aria-label={currentLang === 'fa' ? 'رفتن به راست' : 'Nach rechts scrollen'}
        title={currentLang === 'fa' ? 'رفتن به راست' : 'Nach rechts scrollen'}
      >
        ›
      </button>
    </div>
  );
}
