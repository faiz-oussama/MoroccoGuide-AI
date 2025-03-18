import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

function Service() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-20">
      {/* Service Section 1*/}
      <section className="relative bg-white z-40 pt-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 tracking-tight">
              Your Journey,{' '}
              <span className="relative">
                <span className="relative inline-block">
                  AI-Powered
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-sahara-red/30 to-chefchaouen-blue/30 -rotate-1"></div>
                </span>
              </span>{' '}
              Trip
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience Morocco like never before with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-sahara-red/10 to-chefchaouen-blue/10 rounded-full">
                <span className="text-sahara-red font-semibold">Smart Planning</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">The Most Optimal Route</h3>
              <p className="text-gray-600 leading-relaxed">
                Craft your perfect itinerary with Trip Planner AI. Our advanced algorithms take into account your selected explore-sights, 
                dining, and lodging preferences to create the optimal travel plan tailored just for you.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sahara-red/5 to-chefchaouen-blue/5 rounded-3xl transform rotate-3"></div>
              <img 
                className="relative w-full rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2" 
                src="/assets/images/travelers.svg" 
                alt="Travelers"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-chefchaouen-blue/5 to-sahara-red/5 rounded-3xl transform -rotate-3"></div>
              <img 
                className="relative w-11/12 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2" 
                src="/assets/images/location.svg" 
                alt="Traveler"
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-chefchaouen-blue/10 to-sahara-red/10 rounded-full">
                <span className="text-chefchaouen-blue font-semibold">Social Integration</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Get Inspired</h3>
              <p className="text-gray-600 leading-relaxed">
                Extract valuable travel insights from Instagram reels and TikToks, explore the mentioned sights, 
                and effortlessly include them in your own adventure with Trip Planner AI.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Service Section 2*/}
      <section className="relative bg-white pt-40">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-5 mb-16">
            <h2 className="text-xl md:text-xl font-semibold bg-gradient-to-r from-sahara-red to-chefchaouen-blue bg-clip-text text-transparent">
              Trip Planner AI
            </h2>
            <h1 className="text-2xl md:text-5xl font-bold text-gray-800 tracking-tight">
              The only tool you'll ever need!
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Say goodbye to the stress of planning and hello to personalized recommendations, 
              efficient itineraries, and seamless dining experiences.
            </p>
          </div>
        </div>

        {/* Card Section */}
        <div className="container mx-auto px-2 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle 
                    className="text-xl font-bold">
                   <div class="flex items-center gap-3">
                      <img alt="" loading="lazy" width="300" height="300" decoding="async" data-nimg="1" class="h-[3rem] w-auto md:h-[5rem]" src="/assets/images/map.webp" />
                      <p class="leading-2 max-w-[12rem] text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">Optimal Route Planning</p>
                    </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Our AI algorithms analyze your preferences to craft the most efficient route, saving you time and effort.</p>
              </CardContent>
              <CardFooter className="font-semibold bg-gradient-to-r from-sahara-red to-chefchaouen-blue bg-clip-text text-transparent">
                Learn more →
              </CardFooter>
            </Card>

            <Card className="w-full">
              <CardHeader>
              <CardTitle 
                    className="text-xl font-bold">
                   <div class="flex items-center gap-3">
                      <img alt="" loading="lazy" width="300" height="300" decoding="async" data-nimg="1" class="h-[3rem] w-auto md:h-[5rem]" src="/assets/images/story.webp" />
                      <p class="leading-2 max-w-[12rem] text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">Personalize Your Adventure</p>
                    </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Shape your journey by freely adding, editing, or deleting activities from your itinerary, You have full control.</p>
              </CardContent>
              <CardFooter className="font-semibold bg-gradient-to-r from-sahara-red to-chefchaouen-blue bg-clip-text text-transparent">
                Learn more →
              </CardFooter>
            </Card>

            <Card className="w-full">
              <CardHeader>
              <CardTitle 
                    className="text-xs font-bold pr-4 mr-4">
                   <div class="flex items-center gap-2">
                      <img alt="" loading="lazy" width="300" height="300" decoding="async" data-nimg="1" class="h-[3rem] w-auto md:h-[5rem]" src="/assets/images/food.webp" />
                      <p class="leading-2 max-w-[12rem] text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">Local Cuisine Recommendations</p>
                    </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Discover local cuisines and hidden gems recommended by our AI, tailored to your taste buds.</p>
              </CardContent>
              <CardFooter className="font-semibold bg-gradient-to-r from-sahara-red to-chefchaouen-blue bg-clip-text text-transparent">
                Learn more →
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Service