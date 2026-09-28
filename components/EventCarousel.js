import { useRef, useState, useEffect } from 'react';

export default function EventCarousel({ children, currentLang }) {
  const containerRef = useRef(null);
  const scrollViewportRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isRTL = currentLang === 'fa';

  // Check scroll position and update button states
  const checkScroll = () => {
    if (!scrollViewportRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollViewportRef.current;

    // For RTL, scrollLeft behavior is inverted in some browsers
    // We check if we can scroll in either direction
    setCanScrollLeft(scrollLeft > 0 || scrollWidth > clientWidth);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
  };

  useEffect(() => {
    checkScroll();
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.addEventListener('scroll', checkScroll);
      return () => viewport.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Get scroll amount based on viewport and card size
  const getScrollAmount = () => {
    if (!scrollViewportRef.current) return 320;
    const { clientWidth } = scrollViewportRef.current;
    // Calculate based on visible cards: scroll by about one full card width
    return Math.max(clientWidth / 3.5, 280);
  };

  const scroll = (direction) => {
    if (!scrollViewportRef.current) return;

    const scrollAmount = getScrollAmount();
    const container = scrollViewportRef.current;

    if (direction === 'right') {
      // For both LTR and RTL, scroll "right" means forward through content
      container.scrollBy({
        left: isRTL ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    } else {
      // For both LTR and RTL, scroll "left" means backward through content
      container.scrollBy({
        left: isRTL ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }

    // Update button states after scroll
    setTimeout(checkScroll, 300);
  };

  const handleLeftArrowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    scroll('left');
  };

  const handleRightArrowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    scroll('right');
  };

  return (
    <div className="carousel-wrapper" ref={containerRef}>
      <button
        type="button"
        className="carousel-arrow carousel-arrow-left"
        onClick={handleLeftArrowClick}
        aria-label={currentLang === 'fa' ? 'رفتن به چپ' : 'Nach links scrollen'}
        title={currentLang === 'fa' ? 'رفتن به چپ' : 'Nach links scrollen'}
        disabled={!canScrollLeft}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div className="event-carousel" ref={scrollViewportRef}>
        <div className="carousel-container">
          {children}
        </div>
      </div>

      <button
        type="button"
        className="carousel-arrow carousel-arrow-right"
        onClick={handleRightArrowClick}
        aria-label={currentLang === 'fa' ? 'رفتن به راست' : 'Nach rechts scrollen'}
        title={currentLang === 'fa' ? 'رفتن به راست' : 'Nach rechts scrollen'}
        disabled={!canScrollRight}
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
