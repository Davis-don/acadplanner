import { useState } from 'react';
import Template from "./Template";
import './templatecontent.css';
import EditTemplate from './Edittemplate';
import PreviewTemplate from './PreviewTemplate';

type TemplateView = 'new' | 'edit' | 'preview';

function Templatecontent() {
  const [activeView, setActiveView] = useState<TemplateView>('new');

  const renderView = () => {
    switch (activeView) {
      case 'new':
        return <Template />;
      case 'edit':
        return <EditTemplate />;
      case 'preview':
        return <PreviewTemplate />;
      default:
        return <Template />;
    }
  };

  return (
    <div className="template-content-root">
      {/* Header */}
      <div className="template-content-header">
        <div className="template-content-title-area">
          <div className="template-content-main-title">
            <span className="template-content-icon-large">📅</span>
            <h1 className="template-content-title-text">
              Timetable Studio
            </h1>
          </div>
          <p className="template-content-subtitle">
            Design, edit and preview your academic schedules
          </p>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="template-content-toggle-section">
        <div className="template-content-toggle-container">
          <button
            className={`template-content-toggle-btn ${activeView === 'new' ? 'active' : ''}`}
            onClick={() => setActiveView('new')}
          >
            <span className="template-content-toggle-icon">✨</span>
            <span className="template-content-toggle-label">New Template</span>
          </button>
          
          <button
            className={`template-content-toggle-btn ${activeView === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveView('edit')}
          >
            <span className="template-content-toggle-icon">✏️</span>
            <span className="template-content-toggle-label">Edit Template</span>
          </button>
          
          <button
            className={`template-content-toggle-btn ${activeView === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveView('preview')}
          >
            <span className="template-content-toggle-icon">👁️</span>
            <span className="template-content-toggle-label">Preview Template</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Bar - Only shown for preview */}
      {activeView === 'preview' && (
        <div className="template-content-quick-actions">
          <button className="template-content-action-btn">
            <span className="template-content-action-icon">📤</span>
            Export
          </button>
          <button className="template-content-action-btn">
            <span className="template-content-action-icon">🔄</span>
            Compare
          </button>
          <button className="template-content-action-btn">
            <span className="template-content-action-icon">⭐</span>
            Set Default
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="template-content-main">
        {activeView === 'new' ? (
          renderView()
        ) : (
          <div className="template-content-card">
            <div className="template-content-card-header">
              <div className="template-content-card-title">
                <span className="template-content-card-icon">
                  {activeView === 'edit' ? '✏️' : '👁️'}
                </span>
                <span className="template-content-card-name">
                  {activeView === 'edit' ? 'Edit Templates' : 'Preview Templates'}
                </span>
              </div>
              <span className="template-content-card-badge">
                {activeView === 'edit' ? '2 templates' : '1 active template'}
              </span>
            </div>
            <div className="template-content-card-body">
              {renderView()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Templatecontent;