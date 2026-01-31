// Timetablecontent.tsx
import { useState, useEffect, useRef } from 'react';
import './timetablecontent.css';
import TimetableManagement from './Timetablemanagement';
import SubjectManagement from './Subjectmanagement';
import ClassManagement from './Classmanagement';
import TeacherManagement from './Teachermanagement';

type Tab = {
  id: string;
  label: string;
  component: React.ComponentType;
};

function Timetablecontent() {
  const [activeTab, setActiveTab] = useState<string>('timetable');
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Define tabs
  const tabs: Tab[] = [
    { id: 'timetable', label: '📅 Timetable', component: TimetableManagement },
    { id: 'subjects', label: '📚 Subjects', component: SubjectManagement },
    { id: 'classes', label: '🏫 Classes', component: ClassManagement },
    { id: 'teachers', label: '👨‍🏫 Teachers', component: TeacherManagement },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TimetableManagement;

  // Update indicator position
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabRef = tabRefs.current[activeIndex];
    
    if (activeTabRef) {
      setIndicatorStyle({
        width: `${activeTabRef.offsetWidth}px`,
        transform: `translateX(${activeTabRef.offsetLeft}px)`,
      });
    }
  }, [activeTab]);

  return (
    <div className="tt-overall-container">
      
      {/* Header */}
      <div className="tt-header">
        <h1 className="tt-title">Academic Management</h1>
        <p className="tt-subtitle">Manage timetables, subjects, classes, and teachers</p>
      </div>

      {/* Tabs */}
      <div className="tt-tabs-container">
        <div className="tt-tab-indicator" style={indicatorStyle} />
        
        {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={el => { tabRefs.current[index] = el; }}
              className={`tt-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Content */}
      <div className="tt-content-area">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default Timetablecontent;