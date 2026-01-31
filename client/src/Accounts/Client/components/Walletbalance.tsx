// Updated Walletbalance.tsx
import './walletbalance.css';
import { useState, useRef, useEffect } from 'react';
import Paymentmodal from './Paymentmodat';

interface WalletData {
  balance: number;
  currency: string;
}

function Walletbalance() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 12500,
    currency: 'KES'
  });
  
  const [isPulsing, setIsPulsing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format the balance with comma separators
  const formatBalance = (amount: number): string => {
    return amount.toLocaleString('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Handle add funds button click - now opens modal
  const handleAddFunds = () => {
    setShowPaymentModal(true);
    setShowTooltip(false);
  };

  // Handle wallet click to show/hide tooltip
  const handleWalletClick = () => {
    setShowTooltip(!showTooltip);
  };

  // Handle payment success (will be called from modal)
  const handlePaymentSuccess = (amount: number) => {
    setIsPulsing(true);
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance + amount
    }));
    
    setTimeout(() => {
      setIsPulsing(false);
    }, 500);
  };
  
  // prevent unused variable warning by referencing the function (no-op)
  void handlePaymentSuccess;

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="wb-container" ref={containerRef}>
        {/* Wallet Balance Display */}
        <div 
          className={`wb-balance-pill ${isPulsing ? 'wb-pulse' : ''}`}
          onClick={handleWalletClick}
        >
          <span className="wb-currency-symbol">
            <span className="wb-wallet-icon">💰</span>
            <span>Ksh</span>
          </span>
          <span className="wb-balance">{formatBalance(walletData.balance)}</span>
        </div>

        {/* Add Funds Button */}
        <button 
          className="wb-add-btn"
          onClick={handleAddFunds}
          aria-label="Add funds to wallet"
          title="Add funds"
        >
          +
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="wb-tooltip show" ref={tooltipRef}>
            <div className="wb-tooltip-title">Wallet Balance</div>
            <div className="wb-tooltip-balance">
              {walletData.currency} {walletData.balance.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
              Available for academic services
            </div>
            <div className="wb-tooltip-actions">
              <button 
                className="wb-tooltip-btn"
                onClick={() => {
                  alert('View transaction history coming soon!');
                  setShowTooltip(false);
                }}
              >
                History
              </button>
              <button 
                className="wb-tooltip-btn"
                onClick={handleAddFunds}
              >
                Add Funds
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <Paymentmodal
          currentBalance={walletData.balance}
          currency={walletData.currency}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}

export default Walletbalance;