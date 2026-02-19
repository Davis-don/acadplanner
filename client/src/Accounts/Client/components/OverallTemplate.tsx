// OverallTemplate.tsx
import React, { useState } from "react";
import {
  Page,
  Document,
  PDFViewer,
  PDFDownloadLink,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";
import './overalltemplate.css';

interface SchoolClass {
  class_id: string;
  class_name: string;
  stream: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TimetableBreak {
  break_name: string;
  duration_minutes: number;
  position: number;
}

interface TimetableTemplateData {
  template_id: string;
  name: string;
  description: string;
  day_start_time: string;
  lesson_duration_minutes: number;
  lessons_per_day: number;
  active_days: string[];
  breaks: TimetableBreak[];
  created_at: string;
}

interface OverallTemplateProps {
  classStreams: SchoolClass[];
  templateData: TimetableTemplateData | null;
  groupedClasses: Record<string, SchoolClass[]>;
}

interface TimeSlot {
  type: 'lesson' | 'break';
  lessonNumber?: number;
  breakInfo?: TimetableBreak;
  startTime: string;
  endTime: string;
  displayTime: string;
  duration: number;
}

// PDF Styles - Optimized for A4 Landscape with larger boxes
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: 'Helvetica'
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1e293b",
    paddingBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase"
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    color: "#475569"
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1e293b",
    textAlign: "center",
    backgroundColor: "#f1f5f9",
    padding: 8
  },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    flex: 1
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 35
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    minHeight: 45
  },
  classCell: {
    width: "12%",
    padding: 8,
    fontSize: 11,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    backgroundColor: "#f3f4f6",
    textAlign: "left",
    justifyContent: "center"
  },
  lessonCell: {
    width: "8%",
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center"
  },
  breakCell: {
    width: "10%",
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    justifyContent: "center"
  },
  lastCell: {
    borderRightWidth: 0
  },
  breakName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#92400e",
    textTransform: "uppercase",
    marginBottom: 2
  },
  breakDuration: {
    fontSize: 8,
    color: "#b45309"
  },
  lessonNumber: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2
  },
  timeText: {
    fontSize: 8,
    color: "#4b5563"
  },
  footer: {
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db"
  }
});

function OverallTemplate({ classStreams, templateData }: OverallTemplateProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  // Helper function to format time
  const formatTimeForDisplay = (date: Date): string => {
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12 || 12;
    return `${hour}:${minute}${ampm}`;
  };

  // Calculate all time slots including breaks
  const calculateTimeSlots = (): TimeSlot[] => {
    if (!templateData) return [];

    const [startHours, startMinutes] = templateData.day_start_time.split(':').map(Number);
    const slots: TimeSlot[] = [];
    let currentTime = new Date();
    currentTime.setHours(startHours, startMinutes, 0);

    for (let i = 1; i <= templateData.lessons_per_day; i++) {
      // Check if there's a break at this position
      const breakAtThisPosition = templateData.breaks?.find(b => b.position === i);
      
      if (breakAtThisPosition) {
        // Add break slot
        const breakStart = new Date(currentTime);
        const breakEnd = new Date(currentTime.getTime() + breakAtThisPosition.duration_minutes * 60000);
        
        slots.push({
          type: 'break',
          breakInfo: breakAtThisPosition,
          startTime: formatTimeForDisplay(breakStart),
          endTime: formatTimeForDisplay(breakEnd),
          displayTime: `${formatTimeForDisplay(breakStart)}-${formatTimeForDisplay(breakEnd)}`,
          duration: breakAtThisPosition.duration_minutes
        });
        
        // Move current time past the break
        currentTime = new Date(breakEnd);
      }
      
      // Add lesson slot
      const lessonStart = new Date(currentTime);
      const lessonEnd = new Date(currentTime.getTime() + templateData.lesson_duration_minutes * 60000);
      
      slots.push({
        type: 'lesson',
        lessonNumber: i,
        startTime: formatTimeForDisplay(lessonStart),
        endTime: formatTimeForDisplay(lessonEnd),
        displayTime: `${formatTimeForDisplay(lessonStart)}-${formatTimeForDisplay(lessonEnd)}`,
        duration: templateData.lesson_duration_minutes
      });
      
      // Move current time past the lesson
      currentTime = new Date(lessonEnd);
    }

    return slots;
  };

  // Sort classes in specific order: Form classes first (by number), then Grade classes
  const getSortedClasses = (): SchoolClass[] => {
    return [...classStreams].sort((a, b) => {
      const aLower = a.class_name.toLowerCase();
      const bLower = b.class_name.toLowerCase();
      
      const isFormA = aLower.includes('form') || aLower.includes('f.') || aLower.startsWith('f');
      const isFormB = bLower.includes('form') || bLower.includes('f.') || bLower.startsWith('f');
      const isGradeA = aLower.includes('grade') || aLower.includes('g.') || aLower.startsWith('g');
      const isGradeB = bLower.includes('grade') || bLower.includes('g.') || bLower.startsWith('g');

      // Form classes come before Grade classes
      if (isFormA && !isFormB) return -1;
      if (!isFormA && isFormB) return 1;

      // Extract numbers from class names
      const getClassNumber = (className: string): number => {
        const match = className.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };

      const numA = getClassNumber(a.class_name);
      const numB = getClassNumber(b.class_name);

      if (isFormA && isFormB) {
        // Sort Form classes in descending order (Form 4, Form 3, Form 2, Form 1)
        return numB - numA;
      }

      if (isGradeA && isGradeB) {
        // Sort Grade classes in descending order (Grade 12, Grade 11, Grade 10, etc.)
        return numB - numA;
      }

      // If both are same type, sort by number then stream
      if (numA !== numB) return numB - numA;
      return a.stream.localeCompare(b.stream);
    });
  };

  const timeSlots = calculateTimeSlots();
  const sortedClasses = getSortedClasses();

  // PDF Document Component
  const TimetablePDF = () => (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        {/* Header - Centered */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{templateData?.name || 'SCHOOL TIMETABLE'}</Text>
          {templateData?.description && (
            <Text style={pdfStyles.subtitle}>{templateData.description}</Text>
          )}
        </View>

        {/* Day Header */}
        <Text style={pdfStyles.dayHeader}>
          {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} • {templateData?.day_start_time} start • {templateData?.lesson_duration_minutes}min lessons
        </Text>

        {/* Timetable Table */}
        <View style={pdfStyles.table}>
          {/* Header Row */}
          <View style={pdfStyles.tableHeaderRow}>
            <Text style={pdfStyles.classCell}>Class/Time</Text>
            {timeSlots.map((slot, index) => (
              <View 
                key={index} 
                style={index === timeSlots.length - 1
                  ? [slot.type === 'break' ? pdfStyles.breakCell : pdfStyles.lessonCell, pdfStyles.lastCell]
                  : (slot.type === 'break' ? pdfStyles.breakCell : pdfStyles.lessonCell)
                }
              >
                {slot.type === 'break' ? (
                  <>
                    <Text style={pdfStyles.breakName}>{slot.breakInfo?.break_name}</Text>
                    <Text style={pdfStyles.breakDuration}>{slot.displayTime}</Text>
                  </>
                ) : (
                  <>
                    <Text style={pdfStyles.lessonNumber}>L{slot.lessonNumber}</Text>
                    <Text style={pdfStyles.timeText}>{slot.displayTime}</Text>
                  </>
                )}
              </View>
            ))}
          </View>

          {/* Class Rows */}
          {sortedClasses.map((schoolClass) => (
            <View key={schoolClass.class_id} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.classCell}>
                {schoolClass.class_name} {schoolClass.stream}
              </Text>
              {timeSlots.map((slot, colIndex) => (
                <View 
                  key={colIndex} 
                  style={colIndex === timeSlots.length - 1
                    ? [slot.type === 'break' ? pdfStyles.breakCell : pdfStyles.lessonCell, pdfStyles.lastCell]
                    : (slot.type === 'break' ? pdfStyles.breakCell : pdfStyles.lessonCell)
                  }
                >
                  {slot.type === 'break' ? (
                    <Text style={{ fontSize: 9, color: '#92400e' }}>BREAK</Text>
                  ) : (
                    <Text style={{ fontSize: 9 }}>—</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          Generated on {new Date().toLocaleDateString()} • Timetable Template
        </Text>
      </Page>
    </Document>
  );

  const timeSlotsForDisplay = calculateTimeSlots();
  const sortedClassesForDisplay = getSortedClasses();

  // If no template data, show message
  if (!templateData) {
    return (
      <div className="overall-template-container">
        <div className="overall-template-empty">
          <div className="overall-template-empty-icon">📋</div>
          <h3 className="overall-template-empty-title">No Template Configured</h3>
          <p className="overall-template-empty-message">
            Please create a timetable template first to see the preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overall-template-container">
      {/* Controls */}
      <div className="overall-template-controls">
        <div className="overall-template-day-selector">
          <label htmlFor="day-select">Select Day: </label>
          <select 
            id="day-select" 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(e.target.value)}
            className="overall-template-day-select"
          >
            {templateData.active_days?.map(day => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="overall-template-actions">
          <button 
            className="overall-template-pdf-btn"
            onClick={() => setShowPDF(!showPDF)}
          >
            {showPDF ? 'Show Preview' : 'Show PDF View'}
          </button>
          
          <PDFDownloadLink
            document={<TimetablePDF />}
            fileName={`timetable-${selectedDay}.pdf`}
            className="overall-template-download-btn"
          >
            {({ loading }) => (
              loading ? 'Generating PDF...' : '📥 Download PDF'
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* PDF Viewer or HTML Preview */}
      {showPDF ? (
        <div className="overall-template-pdf-viewer">
          <PDFViewer width="100%" height="800px">
            <TimetablePDF />
          </PDFViewer>
        </div>
      ) : (
        <div className="overall-template-preview">
          {/* Header */}
          <div className="overall-template-preview-header">
            <h2 className="overall-template-preview-title">{templateData.name}</h2>
            {templateData.description && (
              <p className="overall-template-preview-subtitle">{templateData.description}</p>
            )}
          </div>

          {/* Day Header */}
          <div className="overall-template-preview-day">
            {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} • {templateData.day_start_time} start • {templateData.lesson_duration_minutes}min lessons
          </div>

          {/* Timetable Grid */}
          <div className="overall-template-grid-wrapper">
            <div className="overall-template-grid">
              {/* Header Row */}
              <div className="overall-template-grid-row overall-template-grid-header">
                <div className="overall-template-grid-cell overall-template-class-header">Class/Time</div>
                {timeSlotsForDisplay.map((slot, index) => (
                  <div 
                    key={index} 
                    className={`overall-template-grid-cell ${
                      slot.type === 'break' ? 'overall-template-break-header' : 'overall-template-lesson-header'
                    }`}
                  >
                    {slot.type === 'break' ? (
                      <>
                        <div className="overall-template-break-name">{slot.breakInfo?.break_name}</div>
                        <div className="overall-template-break-time">{slot.displayTime}</div>
                      </>
                    ) : (
                      <>
                        <div className="overall-template-lesson-number">Lesson {slot.lessonNumber}</div>
                        <div className="overall-template-lesson-time">{slot.displayTime}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Class Rows */}
              {sortedClassesForDisplay.map((schoolClass) => (
                <div key={schoolClass.class_id} className="overall-template-grid-row">
                  <div className="overall-template-grid-cell overall-template-class-cell">
                    {schoolClass.class_name} {schoolClass.stream}
                  </div>
                  {timeSlotsForDisplay.map((slot, index) => (
                    <div 
                      key={index} 
                      className={`overall-template-grid-cell ${
                        slot.type === 'break' ? 'overall-template-break-cell' : 'overall-template-lesson-cell'
                      }`}
                    >
                      {slot.type === 'break' ? (
                        <div className="overall-template-break-content">BREAK</div>
                      ) : (
                        <div className="overall-template-lesson-content">—</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverallTemplate;