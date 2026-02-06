import { useState, useEffect } from "react";
import AddTeacherComponent from "./AddTeacherComponent";
import AllTeachersComponent from "./AllTeachersComponent";
import './teacherscontent.css'

function TeachersContent() {
  const [activeTab, setActiveTab] = useState("allTeachers");
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Update tab indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = document.querySelector<HTMLElement>('.teachers-content-tab-button--active');
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
    <div className="teachers-content-root-container">
      {/* Header with Tabs */}
      <div className="teachers-content-header-section">
        <div className="teachers-content-tab-navigation">
          <button
            className={`teachers-content-tab-button ${
              activeTab === "allTeachers"
                ? "teachers-content-tab-button--active"
                : "teachers-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("allTeachers")}
            aria-selected={activeTab === "allTeachers"}
            role="tab"
          >
            <span className="teachers-content-tab-button-content">
              <svg 
                className="teachers-content-tab-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.197V7a4 4 0 00-8 0v4m-4 5h10m-10 0v-1m0 1a2 2 0 110 4m0-4v3"
                />
              </svg>
              <span className="teachers-content-tab-text">All Teachers</span>
            </span>
          </button>
          
          <button
            className={`teachers-content-tab-button ${
              activeTab === "addTeacher"
                ? "teachers-content-tab-button--active"
                : "teachers-content-tab-button--inactive"
            }`}
            onClick={() => handleTabClick("addTeacher")}
            aria-selected={activeTab === "addTeacher"}
            role="tab"
          >
            <span className="teachers-content-tab-button-content">
              <svg 
                className="teachers-content-tab-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="teachers-content-tab-text">Add New Teacher</span>
            </span>
          </button>
        </div>
        <div 
          className="teachers-content-tab-indicator" 
          style={indicatorStyle}
          role="presentation"
        />
      </div>

      {/* Content Area */}
      <div className="teachers-content-body-section">
        <div className="teachers-content-dynamic-area">
          {isLoading && (
            <div className="teachers-content-loading-overlay">
              <div className="teachers-content-spinner" aria-label="Loading" />
            </div>
          )}

          {/* All Teachers Panel */}
          <div 
            className={`teachers-content-panel-wrapper ${
              activeTab === "allTeachers" && !isLoading
                ? "teachers-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="all-teachers-tab"
            hidden={activeTab !== "allTeachers"}
          >
            <div className="teachers-content-all-teachers-panel">
              <AllTeachersComponent />
            </div>
          </div>

          {/* Add Teacher Panel */}
          <div 
            className={`teachers-content-panel-wrapper ${
              activeTab === "addTeacher" && !isLoading
                ? "teachers-content-panel-wrapper--visible"
                : ""
            }`}
            role="tabpanel"
            aria-labelledby="add-teacher-tab"
            hidden={activeTab !== "addTeacher"}
          >
            <div className="teachers-content-add-teacher-panel">
              <AddTeacherComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeachersContent;