import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  Eye, 
  X,
  List,
  Grid
} from 'lucide-react';

export default function MonthlyCalendar({ events = [], onSelectCompany }) {
  // Current calendar viewing date state
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-01'));
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to format YYYY-MM-DD
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Group events by date string
  const eventsByDate = {};
  events.forEach((ev) => {
    if (!ev.date) return;
    const dateStr = ev.date.split('T')[0];
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(ev);
  });

  // Build grid cells
  const gridCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr,
      events: eventsByDate[dateStr] || []
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    gridCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
      events: eventsByDate[dateStr] || []
    });
  }

  // Next month leading days to complete row
  const remainingCells = 35 - gridCells.length > 0 ? 35 - gridCells.length : (42 - gridCells.length);
  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    gridCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr,
      events: eventsByDate[dateStr] || []
    });
  }

  const todayStr = '2026-09-07';

  // Sorted list for chronological view
  const chronologicalEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Calendar Navigation Bar */}
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {monthNames[month]} {year}
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>
            {events.length} Scheduled Events
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-subtle)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Grid View"
            >
              <Grid size={15} color={viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                border: 'none',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}
              title="List View"
            >
              <List size={15} color={viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>
          </div>

          <button onClick={prevMonth} className="btn-icon-only" title="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="btn-icon-only" title="Next Month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="calendar-container" style={{ border: 'none', borderRadius: 0 }}>
          {/* Weekday Labels */}
          <div className="calendar-days-header">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-grid">
            {gridCells.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const hasEvents = cell.events.length > 0;

              return (
                <div
                  key={idx}
                  className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDayEvents({ date: cell.dateStr, events: cell.events });
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="calendar-date-num">{cell.day}</span>
                    {hasEvents && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: isToday ? 'var(--primary)' : '#e2e8f0',
                        color: isToday ? 'white' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Render event pills */}
                  <div style={{ marginTop: '4px' }}>
                    {cell.events.slice(0, 2).map((ev) => {
                      const isDrive = ev.roundType === 'Drive Notification';
                      return (
                        <div
                          key={ev.id}
                          className={`calendar-event-pill ${isDrive ? 'event-emerald' : 'event-blue'}`}
                          title={`${ev.title}\n${ev.details || ''}`}
                        >
                          {ev.companyName}: {isDrive ? 'Drive Announced' : ev.roundType}
                        </div>
                      );
                    })}
                    {cell.events.length > 2 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '4px' }}>
                        +{cell.events.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Chronological Timeline List View */
        <div style={{ padding: '16px 20px', maxHeight: '420px', overflowY: 'auto' }}>
          {chronologicalEvents.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No scheduled rounds or drives found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chronologicalEvents.map((ev) => {
                const isDrive = ev.roundType === 'Drive Notification';
                return (
                  <div
                    key={ev.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: isDrive ? 'var(--success-bg)' : 'var(--primary-light)',
                        color: isDrive ? 'var(--success)' : 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        minWidth: '85px'
                      }}>
                        {ev.date}
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{ev.companyName}</span>
                          <span className={`badge ${isDrive ? 'badge-notified' : 'badge-in-process'}`}>
                            {ev.roundType}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ev.details}
                        </div>
                      </div>
                    </div>

                    {onSelectCompany && ev.companyId && (
                      <button
                        onClick={() => onSelectCompany(ev.companyId)}
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Eye size={14} />
                        <span>View Company</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Popover / Modal for Day Details */}
      {selectedDayEvents && (
        <div className="modal-overlay" onClick={() => setSelectedDayEvents(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h4 className="modal-title" style={{ fontSize: '1.05rem' }}>
                  Events on {selectedDayEvents.date}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {selectedDayEvents.events.length} drive activities scheduled
                </p>
              </div>
              <button onClick={() => setSelectedDayEvents(null)} className="btn-icon-only">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDayEvents.events.map((ev) => (
                <div 
                  key={ev.id} 
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {ev.companyName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {ev.roundType} {ev.roundNumber > 0 ? `(Round ${ev.roundNumber})` : ''}
                      </div>
                    </div>

                    {onSelectCompany && ev.companyId && (
                      <button
                        onClick={() => {
                          setSelectedDayEvents(null);
                          onSelectCompany(ev.companyId);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </button>
                    )}
                  </div>

                  {ev.details && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', background: 'white', padding: '8px 10px', borderRadius: '6px' }}>
                      {ev.details}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedDayEvents(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
