# MaghrebAI Trip Planner - Frontend

This is the frontend for the MaghrebAI Trip Planner application built with React and Vite.

## Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment

### Deploying to Vercel

1. Create a [Vercel](https://vercel.com) account if you don't have one
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel` and follow the prompts
4. Update the `.env` file to point to your deployed backend

### Deploying to Netlify

1. Create a [Netlify](https://netlify.com) account if you don't have one
2. Create a `netlify.toml` file in the root of the project:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
3. Deploy using the Netlify CLI or GitHub integration
4. Set environment variables in Netlify dashboard

### Environmental Variables

Make sure to set these environment variables in your deployment platform:

- `VITE_API_URL`: URL of your backend API
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `VITE_GOOGLE_PLACES_API_KEY`: Your Google Places API key

## Connecting to the Backend

The frontend is configured to connect to the backend API using the URL specified in the `VITE_API_URL` environment variable. By default, it points to `http://localhost:5000` for local development.

When deploying to production, make sure to update this variable to point to your deployed backend URL. 