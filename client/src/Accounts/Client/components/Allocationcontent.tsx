import { useState, useEffect } from "react";
import AddAllocationComponent from "./AddallocationComponent";
import AllAllocationsComponent from "./AllAllocationsComponent";
import './allocationscontent.css';

function AllocationContent() {
  const [activeTab, setActiveTab] = useState("allAllocations");
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Update tab indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = document.querySelector('.allocation-content-tab-button--active');
      if (activeButton && activeButton instanceof HTMLElement) {
        const { offsetLeft, offsetWidth } = activeButton;
        setIndicatorStyle({
          width: `${offsetWidth}px`,
          transform: `translateX(${offsetLeft}px)`
        });
      } else {
        // reset indicator if no valid HTMLElement is found
        setIndicatorStyle({});
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  const handleTabClick = (tab: string) => {
    setIsLoading(true);
    setActiveTab(tab);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="allocation-content-root-container">
      {/* Header with Tabs */}
      <div className="allocation-content-header-section">
        <div className="allocation-content-tab-navigation">
          <button
            className={`allocation-content-tab-button ${
              activeTab === "allAllocations"
                ? "allocation-content-tab-button--active"
                : "allocation-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("allAllocations")}
            aria-selected={activeTab === "allAllocations"}
            role="tab"
          >
            <span className="allocation-content-tab-button-content">
              <svg 
                className="allocation-content-tab-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="allocation-content-tab-text">All Allocations</span>
            </span>
          </button>
          
          <button
            className={`allocation-content-tab-button ${
              activeTab === "addAllocation"
                ? "allocation-content-tab-button--active"
                : "allocation-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("addAllocation")}
            aria-selected={activeTab === "addAllocation"}
            role="tab"
          >
            <span className="allocation-content-tab-button-content">
              <svg 
                className="allocation-content-tab-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="allocation-content-tab-text">Add New Allocation</span>
            </span>
          </button>
        </div>
        <div 
          className="allocation-content-tab-indicator" 
          style={indicatorStyle}
          role="presentation"
        />
      </div>

      {/* Content Area */}
      <div className="allocation-content-body-section">
        <div className="allocation-content-dynamic-area">
          {isLoading && (
            <div className="allocation-content-loading-overlay">
              <div className="allocation-content-spinner" aria-label="Loading" />
            </div>
          )}

          {/* All Allocations Panel */}
          <div 
            className={`allocation-content-panel-wrapper ${
              activeTab === "allAllocations" && !isLoading
                ? "allocation-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="all-allocations-tab"
            hidden={activeTab !== "allAllocations"}
          >
            <div className="allocation-content-all-allocations-panel">
              <AllAllocationsComponent />
            </div>
          </div>

          {/* Add Allocation Panel */}
          <div 
            className={`allocation-content-panel-wrapper ${
              activeTab === "addAllocation" && !isLoading
                ? "allocation-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="add-allocation-tab"
            hidden={activeTab !== "addAllocation"}
          >
            <div className="allocation-content-add-allocation-panel">
              <AddAllocationComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllocationContent;