import './timetablecontent.css'
import Template from './Template'
import { useState } from 'react'

function Timetablecontent() {
  const [showTemplate, setShowTemplate] = useState(false)

  return (
    <div className="timetable-wrapper">
      <button 
        className="unique-show-button"
        onClick={() => setShowTemplate(true)}
      >
         Template
      </button>
      
      {showTemplate && (
        <div className="unique-template-container">
          <Template />
        </div>
      )}
    </div>
  )
}

export default Timetablecontent