import React, { useState, useEffect } from 'react';

const CarouselWidget = ({ 
  slides = [], 
  autoplay = false, 
  duration = 3000,
  showDots = true,
  showArrows = true
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Default slides if none provided
  const defaultSlides = [
    {
      image: 'https://via.placeholder.com/800x400?text=Slide+1',
      alt: 'Slide 1',
      caption: 'First slide caption'
    },
    {
      image: 'https://via.placeholder.com/800x400?text=Slide+2',
      alt: 'Slide 2',
      caption: 'Second slide caption'
    },
    {
      image: 'https://via.placeholder.com/800x400?text=Slide+3',
      alt: 'Slide 3',
      caption: 'Third slide caption'
    }
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  
  useEffect(() => {
    if (autoplay && activeSlides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % activeSlides.length);
      }, duration);
      return () => clearInterval(timer);
    }
  }, [autoplay, duration, activeSlides.length]);
  
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide(prev => prev === 0 ? activeSlides.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % activeSlides.length);
  };
  
  if (activeSlides.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No slides configured</p>
      </div>
    );
  }
  
  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-900">
      {/* Slides */}
      <div className="relative h-64 md:h-96">
        {activeSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.alt} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {slide.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <p className="text-white text-lg font-medium">{slide.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      {showArrows && activeSlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Dots Navigation */}
      {showDots && activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselWidget;