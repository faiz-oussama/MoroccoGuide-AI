import { motion } from 'framer-motion';
import { Link, Outlet } from 'react-router-dom';

export default function NoHeaderLayout({ children }) {
  return (
    <main>
      {/* Navigation positioned at top center */}
      <div className="absolute top-8 left-1/3 flex justify-center z-20 lg:flex">
        <motion.div 
          className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-7 py-1.5 
                   shadow-lg shadow-indigo-500/10
                   border border-indigo-100/20"
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            delay: 0.2
          }}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/explore", label: "Explore" },
            { to: "/saved-trips", label: "My Itineraries" },
            { to: "/about", label: "About" }
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`relative px-4 py-2 text-sm font-medium rounded-xl
                        transition-all duration-200 ${
                          location.pathname === link.to
                            ? 'text-indigo-600 bg-indigo-50/80'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                        }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r 
                          from-indigo-500/10 to-violet-500/10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </motion.div>
      </div>
      
      {children || <Outlet />}
    </main>
  );
}