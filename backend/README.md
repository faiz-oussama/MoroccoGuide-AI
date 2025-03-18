# MaghrebAI Trip Planner - Backend

This is the backend for the MaghrebAI Trip Planner application built with Express and MongoDB.

## Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GOOGLE_GENERATIVE_AI_KEY=your_google_ai_api_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Run in production mode:**
   ```bash
   npm start
   ```

## Deployment

### Deploying to Render

1. Create a [Render](https://render.com) account if you don't have one
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command: `npm install`
5. Set the start command: `npm start`
6. Add the environment variables in the dashboard

### Deploying to Railway

1. Create a [Railway](https://railway.app) account
2. Create a new project and select your GitHub repository
3. Set environment variables in the Variables tab
4. Railway will automatically detect the Node.js project

### Deploying to Heroku

1. Create a [Heroku](https://heroku.com) account if you don't have one
2. Install the Heroku CLI: `npm i -g heroku`
3. Log in to Heroku: `heroku login`
4. Create a Heroku app: `heroku create your-app-name`
5. Set environment variables: `heroku config:set KEY=VALUE`
6. Deploy your app: `git push heroku main`

### Environmental Variables

Make sure to set these environment variables in your deployment platform:

- `PORT`: Port for the server (often set by the platform)
- `NODE_ENV`: Set to "production" for production deployment
- `MONGODB_URI`: Your MongoDB connection string
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `GOOGLE_GENERATIVE_AI_KEY`: Your Google Generative AI API key
- `FRONTEND_URL`: URL of your deployed frontend (for CORS)

## API Endpoints

The API includes the following endpoints:

- **GET /api/place-photo**: Get a photo for a place
- **POST /api/trips**: Create a new trip
- **GET /api/trips/user/:userId**: Get all trips for a user
- **GET /api/trips/:id**: Get a single trip by ID
- **PUT /api/trips/:id**: Update a trip
- **DELETE /api/trips/:id**: Delete a trip 