import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "./custom/Footer";
import { Globe2, Heart, Compass, Map, Users, Sun, Shield, Star } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const AboutUs = () => {
  return (
    <div className="relative bg-white overflow-hidden" aria-label="About Morocco Journey" role="main">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="max-w-xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
              >
                We're changing the way people explore Morocco
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-lg text-gray-600"
              >
                At Morocco Journey, we're transforming travel experiences across this enchanting kingdom by combining authentic cultural immersion with cutting-edge technology. Our personalized approach connects travelers with Morocco's rich heritage, breathtaking landscapes, and warm hospitality.
              </motion.p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                src="./assets/images/fes.jpg"
                alt="Fez medina"
                loading="lazy"
                decoding="async"
                width="400"
                height="160"
                className="w-full h-40 object-cover rounded-lg"
              />
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                src="./assets/images/explore4.jpg"
                alt="Moroccan architecture"
                loading="lazy"
                decoding="async"
                width="400"
                height="224"
                className="w-full h-56 object-cover rounded-lg mt-8"
              />
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                src="./assets/images/1.jpg"
                alt="Moroccan desert"
                loading="lazy"
                decoding="async"
                width="400"
                height="224"
                className="w-full h-56 object-cover rounded-lg"
              />
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                src="./assets/images/3.jpg"
                alt="Atlas mountains"
                loading="lazy"
                decoding="async"
                width="400"
                height="160"
                className="w-full h-40 object-cover rounded-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0"></div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-3/4 pr-0 lg:pr-12 mb-12 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Our mission
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                We're combining AI-powered planning with deep cultural understanding to create journeys that respect and celebrate the rich heritage of Morocco. Our goal is to showcase the beauty of Moroccan culture while supporting local communities and promoting sustainable tourism.
              </p>
              <p className="text-gray-600 text-lg">
                By partnering with local experts and leveraging technology, we create custom itineraries that allow travelers to experience the authentic essence of Morocco while ensuring that tourism benefits the local economy and preserves cultural traditions for generations to come.
              </p>
            </div>

            <div className="lg:w-1/4">
              <div className="space-y-12">
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    25,000+
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Customized journeys created annually
                  </p>
                </div>
                
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    $8.5 million
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Revenue generated for local communities
                  </p>
                </div>
                
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    8,000+
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Happy travelers annually
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Image Section */}
      <section className="relative">
        <div className="w-full h-80 md:h-96 lg:h-112 overflow-hidden rounded-3xl border border-gray-200">
          <img 
            src="./assets/images/friends.jpg"
            alt="Friends watching a Moroccan sunset"
            loading="lazy"
            decoding="async"
            width="1200"
            height="480"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-white via-indigo-50/20 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our values</h2>
            <p className="text-xl text-gray-600">
              These core values shape every journey we create and every decision we make to ensure authentic, sustainable, and transformative travel experiences across Morocco.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe2 className="h-6 w-6" />,
                title: "Cultural Authenticity",
                description: "We celebrate and respect the rich cultural heritage of Morocco, promoting authentic experiences that honor local traditions and customs."
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: "Sustainable Tourism",
                description: "Our journeys are designed with sustainability in mind, minimizing environmental impact while maximizing positive contributions to Moroccan communities."
              },
              {
                icon: <Compass className="h-6 w-6" />,
                title: "Adventurous Spirit",
                description: "From the Atlas Mountains to the Sahara Desert, we encourage curiosity and exploration, balancing iconic Moroccan destinations with hidden gems."
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Traveler Safety",
                description: "Your safety is our priority. We ensure all our Moroccan experiences meet the highest standards of security while providing peace of mind throughout your journey."
              },
              {
                icon: <Map className="h-6 w-6" />,
                title: "Personalized Journeys",
                description: "We believe no two travelers are alike, which is why we use AI technology to craft customized Moroccan itineraries tailored to your unique preferences."
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Community Connection",
                description: "We foster meaningful interactions between travelers and Moroccan locals, creating opportunities for cultural exchange and mutual understanding."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-indigo-50 group hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="size-16 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">From our travel journal</h2>
            <p className="text-xl text-gray-600">
              Discover stories, travel tips, and insights from our adventures across Morocco.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Exploring the ancient medinas of Fez: A traveler's guide",
                image: "./assets/images/fes.jpg",
                date: "Mar 16, 2023",
                author: "Fatima Zahra"
              },
              {
                title: "Chefchaouen: Getting lost in Morocco's blue city",
                image: "./assets/images/chefchaouen.jpg",
                date: "Feb 28, 2023",
                author: "Yasmine El Fassi"
              },
              {
                title: "Stargazing in the Sahara: A night under Moroccan skies",
                image: "./assets/images/sahara.jpg",
                date: "Jan 12, 2023",
                author: "Omar Benjelloun"
              }
            ].map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 relative overflow-hidden">
                  <img 
                    className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={post.image} 
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="224"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex-1 bg-white p-8 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600 mb-3 flex items-center">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs mr-2">{post.date}</span>
                      <span className="text-gray-600">By {post.author}</span>
                    </p>
                    <a href="#" className="block mt-2">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">{post.title}</h3>
                    </a>
                    <p className="mt-3 text-gray-600 line-clamp-3">
                      Experience the magic of Morocco through our carefully curated travel stories and discover the hidden gems waiting to be explored.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                      Read more
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutUs;