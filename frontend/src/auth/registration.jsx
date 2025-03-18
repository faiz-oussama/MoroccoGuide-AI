import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "./AuthProvider";

export default function SignUp() {
  const [FullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [RetypePassword, setRetypePassword] = useState('')
  const [error, setError] = useState('')
  const { createUser, user, loading } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  // Only redirect to home if already logged in and not in registration process
  useEffect(() => {
    if (user && !loading && !isRegistering) {
      navigate("/");
    }
  }, [user, loading, navigate, isRegistering]);

  if (loading) {
    return (
      <span className="loading loading-dots loading-lg flex item-center mx-auto"></span>
    );
  }
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsRegistering(true);

    // Validate passwords match
    if (password !== RetypePassword) {
      setError('Passwords do not match');
      setIsRegistering(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsRegistering(false);
      return;
    }

    try {
      // Use await to ensure we wait for the createUser to complete
      await createUser(email, password, FullName);
      
      // After successful registration, navigate to login
      navigate("/login");
    } catch (error) {
      // Handle errors
      console.error("Registration error:", error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Email already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/operation-not-allowed':
          setError('Registration is currently disabled');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        default:
          setError('Failed to create account');
      }
    } finally {
      // Always clean up the registering state
      setIsRegistering(false);
    }
  };

  return (
    <>
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign up
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-6 overflow-hidden rounded-lg bg-red-50 ring-1 ring-red-200">
              <div className="flex items-center gap-x-4 p-4">
                <div className="flex-none rounded-full bg-red-50 p-1">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm/6 font-medium text-red-900">
                    {error}
                  </p>
                  <p className="mt-1 text-xs/5 text-red-700">
                    Please check your input and try again
                  </p>
                </div>
              </div>
              <div className="border-t border-red-100 bg-red-50/50 px-4 py-3">
                <div className="flex justify-between text-xs/5">
                  <button 
                    onClick={() => setError('')} 
                    className="font-medium text-red-700 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSignUp}>
              <div>
                  <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                  Full Name
                  </label>
                  <div className="mt-2">
                  <input
                      onChange={(e) => setFullName(e.target.value)}
                      value={FullName}
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  </div>
              </div>  
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Retype Password
              </label>
              <div className="mt-2">
                <input
                  onChange={(e) => setRetypePassword(e.target.value)}
                  value={RetypePassword}
                  id="retypepassword"
                  name="retypepassword"
                  type="password"
                  required
                  autoComplete="retypepassword"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign up
              </button>
            </form>

            <p className="mt-10 text-center text-sm/6 text-gray-500">
              Already a member?{' '}
              <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
        
          </div>
        </div>
      </>
    )
  }
