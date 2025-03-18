import LoadingScreen from '@/components/ui/LoadingScreen';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "./AuthProvider";
export default function login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const { loginUser, loading, user , setLoading } = useContext(AuthContext);
  useEffect(() => {
    if (user) {
      navigate("/create-trip", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      setLoading(false);
      setIsNavigating(false);
    };
  }, [setLoading]);

  if (loading || isNavigating) {
    return <LoadingScreen />;
  }

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      default:
        return 'Failed to sign in';
    }
  };

  const handleCreateAccount = () => {
    setIsNavigating(true);
    navigate('/signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await loginUser(email, password);
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Back button */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/"
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>

      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 relative">
        {/* Form container with enhanced styling */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm relative">
          <div className="absolute inset-0 -z-10 bg-white/95 shadow-2xl shadow-gray-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-8 shadow-xl ring-1 ring-gray-200/50">
            {/* Logo and title */}
            <img
              alt="Your Company"
              src="/assets/logo.png"
              className="mx-auto h-12 w-auto mb-8"
            />
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 mb-8">
              Sign in to your account
            </h2>

            {/* Error message */}
            {error && (
              <div className="mb-6 overflow-hidden rounded-lg bg-red-50 ring-1 ring-red-200 animate-appear">
                <div className="flex items-center gap-x-4 p-4">
                  <div className="flex-none rounded-full bg-red-50 p-1">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm/6 font-medium text-red-900">
                      {error}
                    </p>
                    <p className="mt-1 text-xs/5 text-red-700">
                      Please check your credentials and try again
                    </p>
                  </div>
                </div>
                <div className="border-t border-red-100 bg-red-50/50 px-4 py-3">
                  <div className="flex justify-between text-xs/5">
                    <p className="text-red-700">
                      Need help? <a href="#" className="font-medium hover:text-red-800">Reset your password</a>
                    </p>
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

            {/* Login form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
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

              {/* Submit button with loading state */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Not a member?{' '}
              <button onClick={handleCreateAccount} className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create your account
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
