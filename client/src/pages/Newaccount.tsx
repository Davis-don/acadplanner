import './newaccount.css';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../store/useToaststore';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  agreeTerms: boolean;
}

interface Errors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  agreeTerms?: string;
}

interface UserResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface ApiError {
  [key: string]: string[];
}

function Newaccount() {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const createAccountMutation = useMutation<
    UserResponse,
    ApiError,
    Omit<FormData, 'agreeTerms'>
  >({
    mutationFn: async (userData) => {
      const response = await fetch(`${apiUrl}/users/new_account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      return result;
    },

    onMutate: () => {
      showToast('Creating your account...', 'info', 3);
    },

    onSuccess: (data) => {
      showToast(data.message, 'success', 4);
      
      // Reset form on success
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        agreeTerms: false
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },

    onError: (error) => {
      if (typeof error === 'object') {
        // Convert Django serializer errors to field errors
        const fieldErrors: Errors = {};
        Object.keys(error).forEach(key => {
          if (error[key] && Array.isArray(error[key]) && error[key].length > 0) {
            const errorKey = key as keyof Errors;
            fieldErrors[errorKey] = error[key][0];
          }
        });
        setErrors(fieldErrors);
        
        // Show first error in toast
        const firstErrorKey = Object.keys(error)[0];
        if (firstErrorKey && error[firstErrorKey]?.[0]) {
          showToast(`${error[firstErrorKey][0]}`, 'error', 5);
        } else {
          showToast('Registration failed. Please check your information.', 'error', 5);
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error', 5);
      }
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const key = name as keyof FormData;
    
    setFormData(prev => ({
      ...prev,
      [key]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Basic password length check only
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and privacy policy';
    }
    
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      // Remove agreeTerms from data sent to server
      const { agreeTerms, ...userData } = formData;
      createAccountMutation.mutate(userData);
    } else {
      setErrors(validationErrors);
      // Show first error in toast
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        showToast(firstError, 'error', 4);
      }
    }
  };

  const handleGoogleSignup = () => {
    showToast('Google signup will be implemented soon!', 'info', 3);
  };

  const getPasswordStrength = () => {
    if (!formData.password) return '';
    
    let score = 0;
    if (formData.password.length >= 8) score++;
    if (/[a-z]/.test(formData.password)) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/\d/.test(formData.password)) score++;
    if (/[!@#$%^&*]/.test(formData.password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength();
  const isSubmitting = createAccountMutation.isPending;

  return (
    <div className="nac-overall-container">
      <div className="nac-container">
        <div className="nac-card">
          
          {/* Header */}
          <div className="nac-header">
            <div className="nac-logo">📚</div>
            <h1 className="nac-title">Create Account</h1>
            <p className="nac-subtitle">Join our educator community</p>
          </div>

          {/* Form */}
          <form className="nac-form" onSubmit={handleSubmit}>
            
            {/* Name Row */}
            <div className="nac-form-row">
              <div className="nac-form-group">
                <label className="nac-label">
                  First Name<span className="nac-required">*</span>
                </label>
                <div className="nac-input-wrapper">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`nac-input ${errors.first_name ? 'nac-input-error' : ''}`}
                    placeholder="John"
                    disabled={isSubmitting}
                    autoComplete="given-name"
                  />
                </div>
                {errors.first_name && <div className="nac-error">{errors.first_name}</div>}
              </div>

              <div className="nac-form-group">
                <label className="nac-label">
                  Last Name<span className="nac-required">*</span>
                </label>
                <div className="nac-input-wrapper">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`nac-input ${errors.last_name ? 'nac-input-error' : ''}`}
                    placeholder="Doe"
                    disabled={isSubmitting}
                    autoComplete="family-name"
                  />
                </div>
                {errors.last_name && <div className="nac-error">{errors.last_name}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="nac-form-group">
              <label className="nac-label">
                Email<span className="nac-required">*</span>
              </label>
              <div className="nac-input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`nac-input ${errors.email ? 'nac-input-error' : ''}`}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="nac-error">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="nac-form-group">
              <label className="nac-label">
                Password<span className="nac-required">*</span>
              </label>
              <div className="nac-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`nac-input ${errors.password ? 'nac-input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="nac-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {formData.password && (
                <div className="nac-password-strength">
                  <div className="nac-strength-bar">
                    <div className={`nac-strength-fill ${passwordStrength}`} />
                  </div>
                  <div className={`nac-strength-text nac-strength-${passwordStrength}`}>
                    {passwordStrength === 'weak' && 'Weak password'}
                    {passwordStrength === 'medium' && 'Medium strength'}
                    {passwordStrength === 'strong' && 'Strong password'}
                  </div>
                </div>
              )}
              {errors.password && <div className="nac-error">{errors.password}</div>}
              <div className="nac-hint">
                Password must be at least 8 characters long
              </div>
            </div>

            {/* Confirm Password */}
            <div className="nac-form-group">
              <label className="nac-label">
                Confirm Password<span className="nac-required">*</span>
              </label>
              <div className="nac-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={`nac-input ${errors.confirm_password ? 'nac-input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="nac-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.confirm_password && <div className="nac-error">{errors.confirm_password}</div>}
            </div>

            {/* Terms */}
            <div className="nac-terms-group">
              <label className="nac-checkbox">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="nac-checkbox-input"
                  disabled={isSubmitting}
                />
                <span className="nac-checkbox-custom"></span>
                <span className="nac-checkbox-text">
                  I agree to the{' '}
                  <a href="/terms" className="nac-terms-link">Terms</a>{' '}
                  &{' '}
                  <a href="/privacy" className="nac-terms-link">Privacy Policy</a>
                </span>
              </label>
              {errors.agreeTerms && <div className="nac-error">{errors.agreeTerms}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="nac-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="nac-loading"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Divider */}
            <div className="nac-divider">
              <span>or continue with</span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="nac-google-btn"
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
            >
              <span className="nac-google-icon"></span>
              Google
            </button>

            {/* Login Link */}
            <div className="nac-login-section">
              <span className="nac-login-text">Already have an account?</span>
              <a href="/login" className="nac-login-link">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Newaccount;