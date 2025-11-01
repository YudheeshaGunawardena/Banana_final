import React, { useState, useEffect } from 'react'; // Add useEffect
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import AuthService from '../services/AuthService';
import { setUser, setLoading, setError } from '../store/authSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    
    const result = await AuthService.signInWithEmail(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } else {
      dispatch(setError(result.error));
      toast.error(result.error);
    }
    
    dispatch(setLoading(false));
  };

  const handleGoogleSignIn = async () => {
    dispatch(setLoading(true));
    
    const result = await AuthService.signInWithGoogle();
    
    if (result.success) {
      toast.success('Welcome!');
      navigate('/', { replace: true });
    } else {
      dispatch(setError(result.error));
      toast.error(result.error);
    }
    
    dispatch(setLoading(false));
  };

  // Don't render login form if authenticated (though useEffect should redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >

          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 backdrop-blur-md bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30" id="btn-back">
              <ArrowLeft className="text-white" size={16} />
              <span className="text-white">Back to Home</span>
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-yellow-600 mb-2">🍌</h1>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
        </motion.div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleGoogleSignIn}
                loading={loading}
                className="w-full flex items-center justify-center space-x-2"
              >
                <span>🌐</span>
                <span>Sign in with Google</span>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;