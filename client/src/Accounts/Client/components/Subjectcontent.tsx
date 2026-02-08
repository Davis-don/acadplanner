import { useState, useEffect } from "react";
import AddSubjectComponent from "./Addsubjectcomponent";
import AllSubjectsComponent from "./AllSubjectComponent";
import './subjectcontent.css';

function SubjectContent() {
  const [activeTab, setActiveTab] = useState("allSubjects");
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Update tab indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = document.querySelector<HTMLElement>('.subject-content-tab-button--active');
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
    <div className="subject-content-root-container">
      {/* Header with Tabs */}
      <div className="subject-content-header-section">
        <div className="subject-content-tab-navigation">
          <button
            className={`subject-content-tab-button ${
              activeTab === "allSubjects"
                ? "subject-content-tab-button--active"
                : "subject-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("allSubjects")}
            aria-selected={activeTab === "allSubjects"}
            role="tab"
          >
            <span className="subject-content-tab-button-content">
              <svg 
                className="subject-content-tab-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="subject-content-tab-text">All Subjects</span>
            </span>
          </button>
          
          <button
            className={`subject-content-tab-button ${
              activeTab === "addSubject"
                ? "subject-content-tab-button--active"
                : "subject-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("addSubject")}
            aria-selected={activeTab === "addSubject"}
            role="tab"
          >
            <span className="subject-content-tab-button-content">
              <svg 
                className="subject-content-tab-icon" 
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
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span className="subject-content-tab-text">Add New Subject</span>
            </span>
          </button>
        </div>
        <div 
          className="subject-content-tab-indicator" 
          style={indicatorStyle}
          role="presentation"
        />
      </div>

      {/* Content Area */}
      <div className="subject-content-body-section">
        <div className="subject-content-dynamic-area">
          {isLoading && (
            <div className="subject-content-loading-overlay">
              <div className="subject-content-spinner" aria-label="Loading" />
              <span className="subject-content-loading-text">Loading subjects...</span>
            </div>
          )}

          {/* All Subjects Panel */}
          <div 
            className={`subject-content-panel-wrapper ${
              activeTab === "allSubjects" && !isLoading
                ? "subject-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="all-subjects-tab"
            hidden={activeTab !== "allSubjects"}
          >
            <div className="subject-content-all-subjects-panel">
              <AllSubjectsComponent />
            </div>
          </div>

          {/* Add Subject Panel */}
          <div 
            className={`subject-content-panel-wrapper ${
              activeTab === "addSubject" && !isLoading
                ? "subject-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="add-subject-tab"
            hidden={activeTab !== "addSubject"}
          >
            <div className="subject-content-add-subject-panel">
              <AddSubjectComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectContent;