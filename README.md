# MaghrebAI Trip Planner

A comprehensive travel planning application focused on Morocco destinations, leveraging AI to create personalized trip itineraries.

![MaghrebAI Trip Planner](https://i.imgur.com/your-screenshot-url.png)

## 🌟 Features

- **AI-Powered Trip Generation**: Create customized travel plans based on preferences
- **Interactive Map Views**: Visualize your journey with Google Maps integration
- **Detailed Itineraries**: Day-by-day plans with activities, meals, and attractions
- **Accommodation Recommendations**: Curated hotel options with photos and details
- **Transportation Options**: Information about flights, trains, and buses
- **User Accounts**: Save, manage, and access your trips anytime
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Project Structure

This project follows a monorepo structure with separate frontend and backend directories:

```
maghrebAiTripPlanner/
├── frontend/           # React + Vite frontend application
├── backend/            # Express + MongoDB backend API
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- MongoDB database (local or Atlas)
- Google Maps API Key
- Google Generative AI API Key

### Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/maghrebAiTripPlanner.git
cd maghrebAiTripPlanner
```

2. **Set up the backend**

```bash
cd backend
npm install

# Create a .env file with the following variables:
# PORT=5000
# NODE_ENV=development
# MONGODB_URI=your_mongodb_connection_string
# GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# GOOGLE_GENERATIVE_AI_KEY=your_google_ai_api_key
# FRONTEND_URL=http://localhost:5173 (for CORS)
```

3. **Set up the frontend**

```bash
cd ../frontend
npm install

# Create a .env file with the following variables:
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
# VITE_API_URL=http://localhost:5000
```

### Running the Application

1. **Start the backend server**

```bash
cd backend
npm run dev
```

The backend API will be available at http://localhost:5000.

2. **Start the frontend development server**

```bash
cd frontend
npm run dev
```

The frontend application will be available at http://localhost:5173.

## 🧰 Key Technologies

### Frontend
- React.js with Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API requests
- Google Maps API for interactive maps
- Framer Motion for animations
- Firebase Authentication for user management

### Backend
- Express.js for the API server
- MongoDB with Mongoose for data storage
- Google Generative AI for trip generation
- Google Maps & Places APIs for location data
- JWT for authentication

## 📱 Features In Detail

### Trip Creation
Users can create personalized trip plans by specifying:
- Origin and destination cities
- Travel dates and duration
- Traveler count and type
- Budget level
- Transportation preferences
- Accommodation preferences
- Activity interests and pace

### Daily Itineraries
Each trip includes detailed daily plans with:
- Activities with times and locations
- Meals at recommended restaurants
- Transportation between locations
- Photos of attractions and establishments
- Weather information

### Attraction Information
Detailed information about points of interest:
- Description and historical context
- Opening hours and ticket prices
- Photos and visitor ratings
- Location on the interactive map

### User Management
- Create an account and sign in
- Save generated trips for later viewing
- View history of created trips
- Edit and delete saved trips

## 🚢 Deployment

### Backend Deployment
- **Render**: Set up a Web Service and connect your GitHub repository
- **MongoDB Atlas**: Use a cloud-hosted MongoDB database
- Set the necessary environment variables in your hosting platform

### Frontend Deployment
- **Vercel** or **Netlify**: Connect your GitHub repository for automatic deployments
- Set environment variables for your production API URL and API keys
- Configure build settings to use `npm run build`

## 🔒 Environment Variables

### Backend Variables
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_GENERATIVE_AI_KEY=your_google_ai_api_key
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend Variables
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
VITE_API_URL=https://your-backend-url.com
```

## 🧪 Testing

To run tests for the frontend:
```bash
cd frontend
npm test
```

To run tests for the backend:
```bash
cd backend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

- **Your Name** - [GitHub Profile](https://github.com/your-username)

## 🙏 Acknowledgments

- Google for providing the Maps and Generative AI APIs
- The open-source community for the amazing tools and libraries used in this project
