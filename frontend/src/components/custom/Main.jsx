import React from 'react';
import BackgroundSlideshow from './BackgroundSlideshow';
import Wave from './Wave';
import { Link } from 'react-router-dom';

function Main() {
  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <BackgroundSlideshow />
      </div>
      <div className="z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative pt-24">
        <div className="max-w-2xl text-left space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
            Your Journey Through <br />
            <span className="text-4xl text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              Magical Morocco
            </span>
          </h1>
          
          <p className="text-lg font-light max-w-xl text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            Let AI craft your perfect Moroccan adventure. From the blue streets of Chefchaouen to the 
            Sahara's golden dunes, experience Morocco like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-4">
            <Link
              to="/create-trip"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white 
                       bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 
                       shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            >
              Start Planning
            </Link>

            <a
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white 
                       border-2 border-white/20 rounded-xl hover:bg-white/10 backdrop-blur-sm 
                       transition-all duration-200 bg-black/20"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 18 18" fill="none" stroke="currentColor">
                <path
                  d="M8.18003 13.4261C6.8586 14.3918 5 13.448 5 11.8113V5.43865C5 3.80198 6.8586 2.85821 8.18003 3.82387L12.5403 7.01022C13.6336 7.80916 13.6336 9.44084 12.5403 10.2398L8.18003 13.4261Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Watch Video
            </a>
          </div>

          <div className="pt-1 border-t border-white/10">
            <p className="text-sm text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
              Trusted by thousands of travelers · No credit card required
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <Wave />
      </div>
    </section>
  );
}

export default Main;