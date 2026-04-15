import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  { name: 'Red',    bg: '#dc2626', glow: 'rgba(239,68,68,0.7)',    label: 'Merah'  },
  { name: 'Yellow', bg: '#eab308', glow: 'rgba(234,179,8,0.7)',    label: 'Kuning' },
  { name: 'Green',  bg: '#10b981', glow: 'rgba(16,185,129,0.7)',   label: 'Hijau'  },
  { name: 'Blue',   bg: '#2563eb', glow: 'rgba(59,130,246,0.7)',   label: 'Biru'   },
];

export default function ColorPicker({ isOpen, onSelect }) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              background: '#0a1a0f',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.5rem',
              padding: 'clamp(20px,3vw,40px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(16px,2vw,28px)',
              minWidth: 'min(90vw, 360px)',
            }}
          >
            <p style={{
              color: 'white',
              fontWeight: 900,
              fontSize: 'clamp(14px,1.8vw,20px)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Pilih Warna
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(10px,1.5vw,20px)',
              width: '100%',
            }}>
              {COLORS.map(({ name, bg, glow, label }) => (
                <button
                  key={name}
                  onClick={() => onSelect(name)}
                  style={{
                    background: bg,
                    boxShadow: `0 0 24px ${glow}, 0 8px 20px rgba(0,0,0,0.5)`,
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderRadius: '1rem',
                    height: 'clamp(80px,11vw,130px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    color: 'white',
                    fontSize: 'clamp(14px,1.6vw,20px)',
                    letterSpacing: '0.05em',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = `0 0 36px ${glow}, 0 12px 30px rgba(0,0,0,0.6)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 0 24px ${glow}, 0 8px 20px rgba(0,0,0,0.5)`;
                  }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
