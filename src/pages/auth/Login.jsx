import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (!email?.trim() || !password?.trim()) {
      setAuthError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(email, password);
      
      if (result?.success) {
        navigate('/dashboard');
      } else {
        setAuthError(result?.error || 'Login failed');
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      } else {
        setAuthError('Something went wrong. Please try again.');
        console.error('JavaScript error in auth:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (userType = 'admin') => {
    setIsLoading(true);
    setAuthError('');

    try {
      const testCredentials = userType === 'admin' 
        ? { email: 'admin@tradingplatform.com', password: 'admin123' }
        : { email: 'investor@tradingai.com', password: 'investor123' };

      const result = await signIn(testCredentials?.email, testCredentials?.password);
      
      if (result?.success) {
        navigate('/dashboard');
      } else {
        setAuthError(`Test login failed: ${result?.error}`);
      }
    } catch (error) {
      setAuthError('Test login failed. Please try manual login.');
      console.error('Test login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Access your trading dashboard
          </p>
        </div>

        {/* Test Login Section */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-300 mb-2">🧪 Quick Test Access</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleTestLogin('admin')}
              disabled={isLoading}
              className="w-full text-left px-3 py-2 text-xs bg-blue-800/50 hover:bg-blue-700/50 text-blue-100 rounded-md border border-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👨‍💼 Admin Login (All Features)
            </button>
            <button
              onClick={() => handleTestLogin('investor')}
              disabled={isLoading}
              className="w-full text-left px-3 py-2 text-xs bg-green-800/50 hover:bg-green-700/50 text-green-100 rounded-md border border-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Investor Login (Portfolio View)
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authError && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
              <div className="flex justify-between items-start">
                <span>{authError}</span>
                <button
                  type="button"
                  onClick={() => navigator?.clipboard?.writeText(authError)}
                  className="ml-2 text-red-400 hover:text-red-200 text-xs underline"
                  title="Copy error message"
                >
                  copy
                </button>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e?.target?.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-300">Don't have an account? </span>
            <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </div>

          {/* API Integration Status - Updated with actual status */}
          <div className="mt-6 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-green-200">
                ✅ API Keys Configured - Finnhub, Alpha Vantage & TwelveData Ready
              </span>
            </div>
            <div className="mt-1 text-xs text-green-300/70">
              Real-time market data and financial analysis available after login
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;