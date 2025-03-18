/** @type {import('tailwindcss').Config} */

const flowbite = require("flowbite-react/tailwind");

export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),

  ],
  theme: {
  	extend: {
		height: {
			'screen': '100vh',
		  },
		  fontSize: {
			'7xl': '5rem',
		  },
		  backgroundImage: {
			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
		  },
		transitionProperty: {
			'colors': 'background-color, border-color, color, fill, stroke',
		  },
		  backdropFilter: {
			'none': 'none',
			'blur': 'blur(8px)',
		  },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        'sahara-red': '#E94B3C',
        'chefchaouen-blue': '#2A4494',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		textShadow: {
  			'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
  			'lg': '0 2px 4px rgba(0, 0, 0, 0.5)',
  		}
  	}
  },
  plugins: [
    require('tailwindcss-textshadow'),
    require("tailwindcss-animate"),
    flowbite.plugin(),
  ],
}
