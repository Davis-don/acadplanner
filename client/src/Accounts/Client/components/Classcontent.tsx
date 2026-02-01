import  { useState, useEffect } from "react";
import AddClassComponent from "./Addclasscomponent";
import AllClassesComponent from "./Allclassescomponent";
import './classcontent.css'

function ClassContent() {
  const [activeTab, setActiveTab] = useState("allClasses");
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Update tab indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = document.querySelector<HTMLElement>('.class-content-tab-button--active');
      if (activeButton) {
        const { offsetLeft, offsetWidth } = activeButton;
        setIndicatorStyle({
          width: `${offsetWidth}px`,
          transform: `translateX(${offsetLeft}px)`
        });
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
    <div className="class-content-root-container">
      {/* Header with Tabs */}
      <div className="class-content-header-section">
        <div className="class-content-tab-navigation">
          <button
            className={`class-content-tab-button ${
              activeTab === "allClasses"
                ? "class-content-tab-button--active"
                : "class-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("allClasses")}
            aria-selected={activeTab === "allClasses"}
            role="tab"
          >
            <span className="class-content-tab-button-content">
              <svg 
                className="class-content-tab-icon" 
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
              <span className="class-content-tab-text">All Classes</span>
            </span>
          </button>
          
          <button
            className={`class-content-tab-button ${
              activeTab === "addClass"
                ? "class-content-tab-button--active"
                : "class-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("addClass")}
            aria-selected={activeTab === "addClass"}
            role="tab"
          >
            <span className="class-content-tab-button-content">
              <svg 
                className="class-content-tab-icon" 
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
              <span className="class-content-tab-text">Add New Class</span>
            </span>
          </button>
        </div>
        <div 
          className="class-content-tab-indicator" 
          style={indicatorStyle}
          role="presentation"
        />
      </div>

      {/* Content Area */}
      <div className="class-content-body-section">
        <div className="class-content-dynamic-area">
          {isLoading && (
            <div className="class-content-loading-overlay">
              <div className="class-content-spinner" aria-label="Loading" />
            </div>
          )}

          {/* All Classes Panel */}
          <div 
            className={`class-content-panel-wrapper ${
              activeTab === "allClasses" && !isLoading
                ? "class-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="all-classes-tab"
            hidden={activeTab !== "allClasses"}
          >
            <div className="class-content-all-classes-panel">
              <AllClassesComponent />
            </div>
          </div>

          {/* Add Class Panel */}
          <div 
            className={`class-content-panel-wrapper ${
              activeTab === "addClass" && !isLoading
                ? "class-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="add-class-tab"
            hidden={activeTab !== "addClass"}
          >
            <div className="class-content-add-class-panel">
              <AddClassComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassContent;