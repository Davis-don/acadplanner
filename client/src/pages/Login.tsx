// Login.tsx
import './login.css';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };


  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        alert('Login successful!');
        setIsSubmitting(false);
        // In real app, you would navigate to dashboard
      }, 1500);
    } else {
      setErrors(validationErrors);
    }
  };

  const handleGoogleLogin = () => {
    alert('Google login will be implemented soon!');
  };

  const handleForgotPassword = () => {
    alert('Password reset feature coming soon!');
  };

  return (
    <div className="lgn-overall-container">
      <div className="lgn-container">
        <div className="lgn-card">
          
          {/* Header */}
          <div className="lgn-header">
            <div className="lgn-logo">🔐</div>
            <h1 className="lgn-title">Welcome Back</h1>
            <p className="lgn-subtitle">Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          <form className="lgn-form" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="lgn-input-group">
              <label className="lgn-label">
                Email Address<span className="lgn-required">*</span>
              </label>
              <div className="lgn-input-container">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`lgn-input ${errors.email ? 'lgn-input-error' : ''}`}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <div className="lgn-error">
                  <span className="lgn-error-icon">⚠️</span>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="lgn-input-group">
              <label className="lgn-label">
                Password<span className="lgn-required">*</span>
              </label>
              <div className="lgn-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`lgn-input ${errors.password ? 'lgn-input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="lgn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <div className="lgn-error">
                  <span className="lgn-error-icon">⚠️</span>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="lgn-remember-forgot">
              <label className="lgn-checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="lgn-checkbox-input"
                  disabled={isSubmitting}
                />
                <span className="lgn-checkbox"></span>
                <span className="lgn-checkbox-label">Remember me</span>
              </label>
              
              <button
                type="button"
                className="lgn-forgot-link"
                onClick={handleForgotPassword}
                disabled={isSubmitting}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="lgn-submit-btn"
              disabled={isSubmitting}
              onClick={()=>navigate('/client-account')}
            >
              {isSubmitting ? (
                <>
                  <span className="lgn-loading"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="lgn-divider">
              <span className="lgn-divider-text">or continue with</span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="lgn-google-btn"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <span className="lgn-google-icon"></span>
              Google
            </button>

            {/* Signup Link */}
            <div className="lgn-signup-section">
              <p className="lgn-signup-text">Don't have an account yet?</p>
              <a href="/signup" className="lgn-signup-link">
                Create new account →
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;