// Newaccount.tsx
import './newaccount.css';
import { useState } from 'react';
import type { FormEvent,ChangeEvent } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  schoolName: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

function Newaccount() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    schoolName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.schoolName.trim()) newErrors.schoolName = 'School name required';
    
    if (formData.password.length < 8) {
      newErrors.password = 'Min 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Include uppercase, lowercase & number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Agree to terms to continue';
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
        alert('Account created successfully!');
        setIsSubmitting(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          schoolName: '',
          password: '',
          confirmPassword: '',
          agreeTerms: false
        });
      }, 1000);
    } else {
      setErrors(validationErrors);
    }
  };

  const handleGoogleSignup = () => {
    alert('Google signup will be implemented soon!');
  };

  const getPasswordStrength = () => {
    if (!formData.password) return '';
    
    let score = 0;
    if (formData.password.length >= 8) score++;
    if (/[a-z]/.test(formData.password)) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/\d/.test(formData.password)) score++;
    
    if (score <= 1) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength();

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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="nac-input"
                    placeholder="John"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="nac-error">{errors.firstName}</div>
              </div>

              <div className="nac-form-group">
                <label className="nac-label">
                  Last Name<span className="nac-required">*</span>
                </label>
                <div className="nac-input-wrapper">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="nac-input"
                    placeholder="Doe"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="nac-error">{errors.lastName}</div>
              </div>
            </div>

            {/* School Name */}
            <div className="nac-form-group">
              <label className="nac-label">
                School Name<span className="nac-required">*</span>
              </label>
              <div className="nac-input-wrapper">
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className="nac-input"
                  placeholder="Your school name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="nac-error">{errors.schoolName}</div>
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
                  className="nac-input"
                  placeholder="••••••••"
                  disabled={isSubmitting}
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
                </div>
              )}
              <div className="nac-error">{errors.password}</div>
            </div>

            {/* Confirm Password */}
            <div className="nac-form-group">
              <label className="nac-label">
                Confirm Password<span className="nac-required">*</span>
              </label>
              <div className="nac-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="nac-input"
                  placeholder="••••••••"
                  disabled={isSubmitting}
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
              <div className="nac-error">{errors.confirmPassword}</div>
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
                  <a href="/privacy" className="nac-terms-link">Privacy</a>
                </span>
              </label>
              <div className="nac-error">{errors.agreeTerms}</div>
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
                  Creating...
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