import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const testimonials = [
  {
    quote: "The AI-powered route planning made our Morocco trip so much easier! We discovered hidden gems we would've never found otherwise.",
    author: "Dahman Ilyass",
    role: "Travel Enthusiast",
    image: "/assets/images/dahman.jpg"
  },
  {
    quote: "As a solo traveler, safety was my primary concern. This platform helped me plan the perfect route while keeping safety in mind.",
    author: "Achraf Chalkha",
    role: "Digital Nomad",
    image: "/assets/images/achhraf.jpg"
  },
  {
    quote: "The local cuisine recommendations were spot on! Every restaurant suggested was authentic and amazing.",
    author: "Mohamed Oujdid",
    role: "Food Blogger",
    image: "/assets/images/moujdid.png"
  },
  {
    quote: "I was able to plan my entire trip in just a few minutes. The AI is incredibly intuitive and easy to use.",
    author: "Silue Gninninmaguignon",
    role: "Student",
    image: "/assets/images/silue.jpeg"
  }
];

function Testimonials() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: false
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: true
        }
      }
    ]
  };

  return (
    <div className="relative w-full">
      {/* Top fade gradient - increased height */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white via-white to-transparent z-10" />
      
      <section className="relative isolate overflow-hidden px-6 pt-40 pb-32 sm:pt-48 sm:pb-40 lg:px-8 bg-gradient-to-b from-gray-50/30 to-gray-100/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.sahara-red/5),transparent)] opacity-20" />
        </div>
        
        <div className="flex flex-col items-center gap-8 mx-auto max-w-7xl">
          {/* Enhanced typography and spacing */}
          <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
            <h2 className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sahara-red/10 to-chefchaouen-blue/10 rounded-full">
              <span className="text-base font-semibold bg-gradient-to-r from-sahara-red to-chefchaouen-blue bg-clip-text text-transparent">
                Testimonials
              </span>
            </h2>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight">
              What Our 
              <span className="relative mx-2">
                Travelers
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-sahara-red/30 to-chefchaouen-blue/30 -rotate-1"></div>
              </span>
              Say
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See what our users have to say about revolutionizing their travel experiences with Trip Planner AI.
            </p>
          </div>

          {/* Existing Slider component */}
          <Slider {...settings} className="w-full">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                  <div className="flex flex-col gap-6">
                    <div className="relative">
                      <svg className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-gray-100 opacity-60" 
                           fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                      </svg>
                      <p className="relative text-lg font-medium text-gray-900 mt-8">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{testimonial.author}</h3>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </div>
  );
}

export default Testimonials;