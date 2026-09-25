import React from 'react';
import { Check } from 'lucide-react';

export default function SlotGrid({ slots, selectedSlotId, onSelect }) {
  if (!slots || slots.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
        No charging slots configured for this date.
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Legend color="var(--primary-light)" border="var(--primary-border)" label="Available" dotColor="var(--primary)" />
        <Legend color="var(--surface)" border="var(--border)" label="Booked" dotColor="var(--muted)" />
        <Legend color="rgba(239, 68, 68, 0.15)" border="rgba(239, 68, 68, 0.3)" label="Blocked" dotColor="var(--danger)" />
        <Legend color="var(--primary)" border="var(--primary)" label="Selected" dotColor="#000000" />
      </div>

      {/* Grid of Slots */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
        gap: '0.5rem'
      }}>
        {slots.map(slot => {
          const isAvailable = slot.status === 'AVAILABLE';
          const isSelected = slot.id === selectedSlotId;

          let bg = 'var(--surface-hover)';
          let border = 'var(--border)';
          let color = 'var(--muted)';
          let cursor = 'not-allowed';
          let title = slot.status === 'BOOKED' ? 'This slot is already reserved' : 'This slot is blocked';

          if (isSelected) {
            bg = 'var(--primary)';
            border = 'var(--primary)';
            color = 'var(--primary-contrast)';
            cursor = 'pointer';
            title = 'Selected Slot';
          } else if (isAvailable) {
            bg = 'var(--surface)';
            border = 'var(--primary-border)';
            color = 'var(--text)';
            cursor = 'pointer';
            title = 'Available for reservation';
          }

          return (
            <button
              key={slot.id}
              onClick={() => isAvailable && onSelect(slot)}
              disabled={!isAvailable}
              title={title}
              aria-label={`${slot.startTime} to ${slot.endTime} - ${slot.status}`}
              aria-pressed={isSelected}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.35rem',
                cursor,
                fontSize: '0.75rem',
                color,
                fontWeight: isSelected ? 800 : isAvailable ? 600 : 400,
                textAlign: 'center',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-mono)',
                position: 'relative',
                boxShadow: isSelected ? '0 0 10px var(--primary-glow)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                {isSelected && <Check size={11} strokeWidth={3} />}
                <span>{slot.startTime}</span>
              </div>
              <div style={{ fontSize: '0.68rem', opacity: isSelected ? 0.9 : 0.6 }}>{slot.endTime}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, border, label, dotColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, border: `1px solid ${border}`, flexShrink: 0 }} />
      <span>{label}</span>
    </div>
  );
}
