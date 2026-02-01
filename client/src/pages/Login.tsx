import './login.css';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../store/useToaststore';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  message: string;
  redirect_to: string;
}

interface LoginError {
  detail?: string;
  email?: string[];
  password?: string[];
  non_field_errors?: string[];
}

function Login() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const extractErrorMessage = (errorData: LoginError): string => {
    // Try different error field formats from Django
    if (errorData.detail) {
      return errorData.detail;
    }
    if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
      return errorData.non_field_errors[0];
    }
    if (errorData.email && errorData.email.length > 0) {
      return `Email: ${errorData.email[0]}`;
    }
    if (errorData.password && errorData.password.length > 0) {
      return `Password: ${errorData.password[0]}`;
    }
    return 'Login failed. Please check your credentials.';
  };

  const handleGoogleLogin = () => {
    showToast('Google login feature is coming soon! We\'re working on integrating secure OAuth2 authentication.', 'info', 5);
  };

  const handleForgotPassword = () => {
    showToast('Password reset functionality will be available in our next update. Stay tuned!', 'info', 4);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        showToast(firstError, 'error', 4);
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    // Show submitting toast
    showToast('Authenticating... Please wait', 'info', 3);

    try {
      const res = await fetch(`${apiUrl}/users/api_token/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      // Check content type first
      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!isJson) {
        // Handle non-JSON responses
        const textResponse = await res.text();
        console.error('Non-JSON response from server:', textResponse);
        
        let errorMessage = 'Server returned invalid response format';
        if (res.status === 404) {
          errorMessage = 'Login endpoint not found. Please check if the server is running.';
        } else if (res.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (res.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
        } else if (res.status === 400) {
          errorMessage = 'Bad request. Please check your input.';
        } else if (!res.ok) {
          errorMessage = `Login failed (Status: ${res.status})`;
        }
        
        showToast(errorMessage, 'error', 5);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        const errorData = data as LoginError;
        const errorMessage = extractErrorMessage(errorData);
        
        // Show error toast
        showToast(errorMessage, 'error', 5);
        
        // Set field errors if available
        if (errorData.email?.[0]) {
          setErrors(prev => ({ ...prev, email: errorData.email![0] }));
        }
        if (errorData.password?.[0]) {
          setErrors(prev => ({ ...prev, password: errorData.password![0] }));
        }
      } else {
        const successData = data as LoginResponse;
        
        // Show success toast
        showToast(successData.message || 'Login successful!', 'success', 3);
        
        // Store rememberMe preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberEmail', formData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        
        // Navigate to the backend-provided route
        setTimeout(() => {
          navigate(successData.redirect_to || '/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof SyntaxError) {
        errorMessage = 'Server returned invalid response format.';
      } else if (err instanceof TypeError) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      showToast(errorMessage, 'error', 5);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load remembered email on component mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  });

  return (
    <div className="login-container">
      {/* Background Animation */}
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        {/* Logo & Title */}
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="none" className="logo-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`login-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting}
                autoComplete="email"
              />
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {/* Password Input */}
          <div className="input-group">
            <div className="label-row">
              <label className="input-label">Password</label>
              <button 
                type="button" 
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={isSubmitting}
              >
                Forgot?
              </button>
            </div>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`login-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06006M9.9 4.24006C10.5883 4.0789 11.2931 3.99836 12 4.00006C19 4.00006 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88006" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 1L23 23" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          {/* Remember Me */}
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="checkbox-input"
              disabled={isSubmitting}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">Remember me</span>
          </label>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">Or continue with</span>
            <span className="divider-line"></span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <span className="google-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </span>
            <span className="google-text">Continue with Google</span>
          </button>

          {/* Signup Link */}
          <div className="signup-link">
            Don't have an account?{' '}
            <a href="/signup" className="signup-text">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;