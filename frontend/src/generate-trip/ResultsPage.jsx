import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import TripPlanDisplay from './TripPlanDisplay';

export default function ResultsPage() {
  const location = useLocation();
  const tripPlan = location.state?.tripPlan;
  return (
    <div className="top-0 left-0 w-full h-full z-50 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40">
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        >
        <TripPlanDisplay tripPlan={tripPlan} />
        </motion.div>
    </div>
  );
}