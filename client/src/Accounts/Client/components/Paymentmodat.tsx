// Paymentmodal.tsx
import './paymentmodal.css';
import { useState } from 'react';

interface PaymentModalProps {
  currentBalance: number;
  currency: string;
  onClose: () => void;
}

function Paymentmodal({ currentBalance, currency, onClose }: PaymentModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);

  // Predefined amount options
  const amountOptions = [500, 1000, 2000, 5000, 10000, 20000];

  // Payment method options
  const paymentMethods = [
    { id: 'mpesa', label: 'M-Pesa', icon: '📱' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'bank', label: 'Bank', icon: '🏦' },
  ];

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  // Handle custom amount change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  // Handle payment method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  // Handle proceed to payment
  const handleProceed = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    if (!amount || amount <= 0) {
      alert('Please select or enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Payment of ${currency} ${amount.toLocaleString()} initiated via ${selectedMethod.toUpperCase()}\n\nPayment logic will be implemented soon!`);
      onClose();
    }, 1500);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-KE');
  };

  // Calculate final amount
  const getFinalAmount = () => {
    return customAmount ? parseInt(customAmount) || 0 : selectedAmount || 0;
  };

  // Close modal on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="pm-overlay" onClick={handleOverlayClick}>
      <div className="pm-modal">
        
        {/* Header */}
        <div className="pm-header">
          <button className="pm-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="pm-icon">💰</div>
          <h2 className="pm-title">Add Funds to Wallet</h2>
          <p className="pm-subtitle">Top up your account balance</p>
        </div>

        {/* Loading State */}
        {isProcessing ? (
          <div className="pm-loading">
            <div className="pm-spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please wait while we process your transaction</p>
          </div>
        ) : (
          <>
            {/* Current Balance */}
            <div className="pm-content">
              <div className="pm-current-balance">
                <div className="pm-balance-label">Current Balance</div>
                <div className="pm-balance-amount">
                  <span className="pm-balance-currency">{currency}</span>
                  <span>{formatCurrency(currentBalance)}</span>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="pm-options">
                <div className="pm-option-label">Select Amount</div>
                <div className="pm-amount-buttons">
                  {amountOptions.map(amount => (
                    <button
                      key={amount}
                      className={`pm-amount-btn ${selectedAmount === amount ? 'active' : ''}`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      {currency} {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="pm-custom-amount">
                <div className="pm-option-label">Or enter custom amount</div>
                <div className="pm-input-group">
                  <span className="pm-currency-symbol">{currency}</span>
                  <input
                    type="text"
                    className="pm-custom-input"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="pm-methods">
                <div className="pm-option-label">Payment Method</div>
                <div className="pm-method-options">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      className={`pm-method-btn ${selectedMethod === method.id ? 'active' : ''}`}
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <span className="pm-method-icon">{method.icon}</span>
                      <span className="pm-method-label">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pm-actions">
                <button className="pm-action-btn pm-cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  className="pm-action-btn pm-proceed-btn"
                  onClick={handleProceed}
                  disabled={!getFinalAmount() || getFinalAmount() <= 0}
                >
                  Pay {currency} {formatCurrency(getFinalAmount())}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Paymentmodal;