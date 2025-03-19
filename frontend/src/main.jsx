import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider'
import Login from './auth/Login'
import PrivateRoute from './auth/PrivateRoute'
import SignUp from './auth/registration'
import Layout from './components/custom/Layout'
import NoHeaderLayout from './components/custom/NoHeaderLayout'
import { DatabaseTest } from './components/DatabaseTest'
import CreateTrip from './create-trip/index.jsx'
import ResultsPage from './generate-trip/ResultsPage.jsx'
import './index.css'
import SavedTrips from './saved-trips/viewSavedTrips'
import Explore from './explore/index.jsx'
import AboutUs from './components/AboutUs'

const router = createBrowserRouter([
  {
    path: '/trip-results',
    element: (
      <PrivateRoute>
        <Toaster/>
        <NoHeaderLayout/>
        <ResultsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/DbTest',
    element: <DatabaseTest />

  },
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/explore',
        element: <Explore />,
      },
      {
        path: '/create-trip',
        element: <PrivateRoute>
                    <CreateTrip />
                </PrivateRoute>
      },
      {
        path: '/saved-trips',
        element: <PrivateRoute>
                    <Toaster/>
                    <SavedTrips />
                </PrivateRoute>
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        path: '/itinerary',
        element: <PrivateRoute>
                  <div>My Itinerary Page</div>
                </PrivateRoute>,
      },
      {
        path: '/experiences',
        element: <div>Local Experiences Page</div>,
      },
      {
        path: '/map',
        element: <div>Interactive Map</div>,
      },
      {
        path: '/festivals',
        element: <div>Festivals Page</div>,
      },
      {
        path: '/signin',
        element: <div>Sign In Page</div>,
      },
      {
        path: '/about',
        element: <AboutUs />,
      },
      
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
