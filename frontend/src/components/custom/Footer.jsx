const Footer = () => {
  return (
    <footer className="w-full py-12 px-4 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Logo and Description */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/assets/logo.png" 
            alt="Trip Planner AI Logo" 
            className="h-12 mb-4"
          />
          <p className="text-gray-600 text-center max-w-md">
            Revolutionizing travel experiences in Morocco with AI-powered itinerary planning
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Explore</h3>
            <ul className="space-y-2">
              <li><a href="/destinations" className="text-gray-600 hover:text-sahara-red transition-colors">Destinations</a></li>
              <li><a href="/itineraries" className="text-gray-600 hover:text-sahara-red transition-colors">Itineraries</a></li>
              <li><a href="/experiences" className="text-gray-600 hover:text-sahara-red transition-colors">Experiences</a></li>
              <li><a href="/local-guides" className="text-gray-600 hover:text-sahara-red transition-colors">Local Guides</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-600 hover:text-sahara-red transition-colors">About Us</a></li>
              <li><a href="/blog" className="text-gray-600 hover:text-sahara-red transition-colors">Travel Blog</a></li>
              <li><a href="/careers" className="text-gray-600 hover:text-sahara-red transition-colors">Careers</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-sahara-red transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-600 hover:text-sahara-red transition-colors">Help Center</a></li>
              <li><a href="/safety" className="text-gray-600 hover:text-sahara-red transition-colors">Safety Guide</a></li>
              <li><a href="/faq" className="text-gray-600 hover:text-sahara-red transition-colors">FAQs</a></li>
              <li><a href="/privacy" className="text-gray-600 hover:text-sahara-red transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
            <div className="flex gap-4">
            <a href="https://facebook.com" className="text-gray-500 hover:text-sahara-red">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.95 3.63 9.03 8.36 9.8V15.5H6.28V12h4.08V9.32c0-4.04 2.41-6.28 6.1-6.28 1.75 0 3.42.13 3.42.13v3H15.5c-1.9 0-2.5 1.18-2.5 2.4V12h4.25l-.67 3.5h-3.58v8.3c4.73-.77 8.36-4.85 8.36-9.8C22 6.48 17.52 2 12 2z" />
                </svg>
              </a>
              <a href="https://twitter.com" className="text-gray-500 hover:text-sahara-red">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://tiktok.com" className="text-gray-500 hover:text-sahara-red">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-gray-100 pt-8">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Trip Planner AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;