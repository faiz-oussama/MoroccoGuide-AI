import { useEffect, useState } from 'react';

const images = [
    '/assets/images/1.jpg',
    '/assets/images/2.jpg',
    '/assets/images/3.jpg',
    '/assets/images/4.jpg',
];

export default function BackgroundSlideshow() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((current) => (current + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        className="absolute inset-x-0 top-0 h-28 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.8) 30%,
            rgba(255, 255, 255, 0) 80%)`
        }}
      />
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100 active-slide' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      ))}
    </div>
  );
}