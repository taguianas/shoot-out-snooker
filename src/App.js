import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioManager from './AudioManager';

// ═══════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const T = {
  cyan:        '#00d4ff',
  green:       '#00ff88',
  red:         '#ff2d55',
  amber:       '#ffab00',
  purple:      '#bf5af2',
  bg0:         '#060810',
  bg1:         '#0a0e18',
  glass1:      'rgba(255,255,255,0.035)',
  glass2:      'rgba(255,255,255,0.07)',
  border:      'rgba(255,255,255,0.08)',
  borderCyan:  'rgba(0,212,255,0.45)',
  borderRed:   'rgba(255,45,85,0.45)',
  borderAmber: 'rgba(255,171,0,0.45)',
  borderGreen: 'rgba(0,255,136,0.45)',
  text1:       '#e8eaed',
  text2:       '#8b949e',
  text3:       'rgba(255,255,255,0.3)',
};

// ═══════════════════════════════════════════════════════════════
//  GAME CONSTANTS
// ═══════════════════════════════════════════════════════════════
const BALLS = {
  RED:    { points: 1, name: 'Red',    glow: 'rgba(220,38,38,0.7)'   },
  YELLOW: { points: 2, name: 'Yellow', glow: 'rgba(250,204,21,0.7)'  },
  GREEN:  { points: 3, name: 'Green',  glow: 'rgba(34,197,94,0.7)'   },
  BROWN:  { points: 4, name: 'Brown',  glow: 'rgba(180,83,9,0.7)'    },
  BLUE:   { points: 5, name: 'Blue',   glow: 'rgba(59,130,246,0.7)'  },
  PINK:   { points: 6, name: 'Pink',   glow: 'rgba(236,72,153,0.7)'  },
  BLACK:  { points: 7, name: 'Black',  glow: 'rgba(160,160,180,0.6)' },
};

const BALL_GRADIENTS = {
  RED:    'radial-gradient(circle at 32% 26%, #ffb3b3 0%, #ff4444 18%, #dc2626 45%, #7f0000 78%, #2d0000 100%)',
  YELLOW: 'radial-gradient(circle at 32% 26%, #fffde7 0%, #ffe066 18%, #facc15 45%, #a16207 78%, #3d2800 100%)',
  GREEN:  'radial-gradient(circle at 32% 26%, #d4fce8 0%, #4ade80 18%, #22c55e 45%, #14532d 78%, #052e16 100%)',
  BROWN:  'radial-gradient(circle at 32% 26%, #e8c99a 0%, #c07530 18%, #92400e 45%, #4a1500 78%, #1c0800 100%)',
  BLUE:   'radial-gradient(circle at 32% 26%, #dbeafe 0%, #60a5fa 18%, #3b82f6 45%, #1e3a8a 78%, #0a1628 100%)',
  PINK:   'radial-gradient(circle at 32% 26%, #fce7f3 0%, #f472b6 18%, #ec4899 45%, #9d174d 78%, #3d0020 100%)',
  BLACK:  'radial-gradient(circle at 32% 26%, #a0a0b0 0%, #5a5a6a 18%, #2a2a35 45%, #0d0d12 78%, #000 100%)',
};

const FINAL_COLORS = ['YELLOW', 'GREEN', 'BROWN', 'BLUE', 'PINK', 'BLACK'];

const FOUL_TYPES = [
  { id: 'timeout',   label: 'Shot Clock Expired', icon: '⏱' },
  { id: 'cueball',   label: 'Cue Ball Potted',    icon: '○' },
  { id: 'wrongball', label: 'Wrong Ball Played',  icon: '✕' },
  { id: 'other',     label: 'Other Foul',         icon: '!' },
];

// ═══════════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════════
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const icons = {
    undo:   <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>,
    foul:   <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
    skip:   <><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></>,
    play:   <polygon points="5 3 19 12 5 21 5 3"/>,
    pause:  <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    reset:  <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></>,
    trophy: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 9a6 6 0 0 0 12 0"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></>,
    close:  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    alert:  <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    chevron:<polyline points="6 9 12 15 18 9"/>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SHOT CLOCK
// ═══════════════════════════════════════════════════════════════
const ShotClock = ({ timeLeft, totalTime, isPaused }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 0;
  const offset = circ * (1 - pct);
  const isCritical = timeLeft <= 5 && timeLeft > 0 && !isPaused;
  const isUrgent   = timeLeft <= 10 && timeLeft > 5 && !isPaused;
  const strokeColor = isPaused ? '#3a4060' : isCritical ? T.red : isUrgent ? T.amber : T.cyan;
  const glowColor   = isCritical ? 'rgba(255,45,85,0.9)'  : isUrgent ? 'rgba(255,171,0,0.9)' : 'rgba(0,212,255,0.8)';
  const numColor    = isPaused ? T.text3 : isCritical ? T.red : isUrgent ? T.amber : T.text1;
  const numAnim     = isCritical ? 'pulseRed 0.45s ease-in-out infinite alternate' : isUrgent ? 'pulseAmber 0.6s ease-in-out infinite alternate' : 'none';

  return (
    <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
      {/* Outer ambient glow ring */}
      {!isPaused && (
        <div style={{
          position: 'absolute', inset: -8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${isCritical ? 'rgba(255,45,85,0.08)' : 'rgba(0,212,255,0.06)'} 0%, transparent 70%)`,
          animation: isCritical ? 'bgPulse 0.45s ease-in-out infinite alternate' : 'none',
          pointerEvents: 'none',
        }} />
      )}

      {/* SVG ring */}
      <svg width="148" height="148" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Fill */}
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          style={{
            transition: isPaused ? 'none' : 'stroke-dashoffset 0.98s linear, stroke 0.35s ease',
            filter: isPaused ? 'none' : `drop-shadow(0 0 5px ${glowColor})`,
          }}
        />
      </svg>

      {/* Inner content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <span style={{
          fontFamily: "'Rajdhani', monospace",
          fontSize: 50,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -3,
          color: numColor,
          animation: numAnim,
          transition: 'color 0.3s ease',
          userSelect: 'none',
        }}>
          {timeLeft}
        </span>
        <span style={{
          fontSize: 8,
          letterSpacing: 4,
          color: isPaused ? T.text3 : isCritical ? 'rgba(255,45,85,0.7)' : T.text3,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          {isPaused ? 'PAUSED' : 'SEC'}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  3D SNOOKER BALL
// ═══════════════════════════════════════════════════════════════
const SnookerBall = ({ ballKey, onClick, disabled, size = 64 }) => {
  const ball = BALLS[ballKey];
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const shadow = disabled ? 'none'
    : pressed  ? `0 2px 6px rgba(0,0,0,0.9), inset 0 3px 8px rgba(0,0,0,0.5)`
    : hovered  ? `0 10px 30px rgba(0,0,0,0.6), 0 0 20px ${ball.glow}, inset 0 1px 0 rgba(255,255,255,0.45)`
    : `0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)`;

  const scale = disabled ? 1 : pressed ? 0.87 : hovered ? 1.16 : 1;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => !disabled && setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => { setPressed(false); if (!disabled) onClick?.(); }}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: BALL_GRADIENTS[ballKey],
        border: `2px solid ${disabled ? 'rgba(255,255,255,0.04)' : pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.15 : 1,
        boxShadow: shadow,
        transform: `scale(${scale})`,
        transition: 'transform 0.12s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, opacity 0.28s ease',
        margin: '6px',
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
      }}
    >
      {/* Specular highlight */}
      <div style={{
        position: 'absolute',
        top: '13%', left: '20%',
        width: '32%', height: '24%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Secondary specular */}
      <div style={{
        position: 'absolute',
        top: '55%', right: '14%',
        width: '14%', height: '10%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Point label */}
      <span style={{
        color: ballKey === 'YELLOW' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.92)',
        fontFamily: "'Rajdhani', monospace",
        fontWeight: 900,
        fontSize: size * 0.3,
        textShadow: ballKey === 'YELLOW' ? 'none' : '0 1px 4px rgba(0,0,0,0.8)',
        letterSpacing: -1,
        userSelect: 'none',
        position: 'relative',
        zIndex: 1,
      }}>
        {ball.points}
      </span>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
//  GLASS PANEL
// ═══════════════════════════════════════════════════════════════
const GlassPanel = ({ children, style, glowColor, active }) => (
  <div style={{
    background: T.glass1,
    backdropFilter: 'blur(28px) saturate(200%)',
    WebkitBackdropFilter: 'blur(28px) saturate(200%)',
    border: `1px solid ${active && glowColor ? glowColor : T.border}`,
    borderRadius: 18,
    boxShadow: active && glowColor
      ? `0 0 0 1px ${glowColor}, 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`
      : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    ...style,
  }}>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  SCORE CARD
// ═══════════════════════════════════════════════════════════════
const ScoreCard = ({ player, isActive, index, previousScore }) => {
  const name = player.name || `Player ${index + 1}`;
  const scoreChanged = player.score !== previousScore;

  return (
    <GlassPanel
      active={isActive}
      glowColor={T.borderCyan}
      style={{
        flex: 1,
        padding: '16px 12px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: isActive ? 'rimLight 2.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Active top bar */}
      <div style={{
        position: 'absolute', top: 0, left: '25%', right: '25%',
        height: 2,
        background: isActive
          ? `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`
          : 'transparent',
        transition: 'all 0.4s ease',
        borderRadius: 1,
      }} />

      {/* Status */}
      <div style={{
        fontSize: 9,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: isActive ? T.cyan : T.text3,
        marginBottom: 8,
        fontWeight: 700,
        transition: 'color 0.3s ease',
      }}>
        {isActive ? '▶ AT TABLE' : 'WAITING'}
      </div>

      {/* Score */}
      <div
        key={player.score}
        style={{
          fontFamily: "'Rajdhani', monospace",
          fontSize: 58,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -3,
          color: isActive ? T.text1 : T.text2,
          textShadow: isActive ? `0 0 40px rgba(0,212,255,0.25)` : 'none',
          transition: 'color 0.3s ease, text-shadow 0.3s ease',
          animation: scoreChanged ? 'scoreCount 0.25s ease-out' : 'none',
          userSelect: 'none',
        }}
      >
        {player.score}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 11,
        color: isActive ? T.text2 : T.text3,
        marginTop: 6,
        fontWeight: 600,
        letterSpacing: 1,
        transition: 'color 0.3s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {name}
      </div>
    </GlassPanel>
  );
};

// ═══════════════════════════════════════════════════════════════
//  STATUS BADGE
// ═══════════════════════════════════════════════════════════════
const StatusBadge = ({ redsRemaining, isNextBallColor, inFinalSequence, nextFinalColorIndex }) => {
  let label, color, borderColor;

  if (inFinalSequence) {
    const key = FINAL_COLORS[nextFinalColorIndex];
    const ball = BALLS[key];
    label = `POT THE ${ball?.name.toUpperCase() || 'BALL'}`;
    color = T.amber;
    borderColor = T.borderAmber;
  } else if (isNextBallColor) {
    if (redsRemaining === 0) {
      label = 'FREE CHOICE COLOR';
      color = T.purple;
      borderColor = 'rgba(191,90,242,0.45)';
    } else {
      label = 'POT A COLOR';
      color = T.amber;
      borderColor = T.borderAmber;
    }
  } else {
    label = `POT A RED  •  ${redsRemaining} LEFT`;
    color = T.red;
    borderColor = T.borderRed;
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 18px',
      background: `${color}12`,
      border: `1px solid ${borderColor}`,
      borderRadius: 100,
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color,
      }}>
        {label}
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  FOUL MODAL
// ═══════════════════════════════════════════════════════════════
const FoulModal = ({ onSelect, onClose, penaltyPoints }) => (
  <motion.div
    key="foul-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
  >
    <motion.div
      initial={{ scale: 0.82, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.82, y: 50 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      style={{
        background: 'rgba(8,10,20,0.98)',
        border: `1px solid ${T.borderRed}`,
        borderRadius: 22,
        padding: 28,
        width: '100%',
        maxWidth: 380,
        boxShadow: `0 0 50px rgba(255,45,85,0.18), 0 30px 80px rgba(0,0,0,0.7)`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,45,85,0.12)',
          border: '1px solid rgba(255,45,85,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="alert" size={16} color={T.red} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text1, letterSpacing: 1 }}>Declare Foul</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>Opponent receives +{penaltyPoints} pts</div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: T.text3, padding: 6, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}
        >
          <Icon name="close" size={16} color={T.text3} />
        </button>
      </div>

      {/* Foul options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FOUL_TYPES.map(foul => (
          <FoulOption key={foul.id} foul={foul} onSelect={onSelect} penalty={penaltyPoints} />
        ))}
      </div>
    </motion.div>
  </motion.div>
);

const FoulOption = ({ foul, onSelect, penalty }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(foul)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,45,85,0.12)' : 'rgba(255,45,85,0.04)',
        border: `1px solid ${hovered ? 'rgba(255,45,85,0.5)' : 'rgba(255,45,85,0.18)'}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{foul.icon}</span>
        <span style={{ color: T.text1, fontSize: 14, fontWeight: 600 }}>{foul.label}</span>
      </div>
      <span style={{
        color: T.red, fontSize: 14, fontWeight: 900,
        fontFamily: "'Rajdhani', monospace",
      }}>
        +{penalty}
      </span>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
//  GAME OVER MODAL
// ═══════════════════════════════════════════════════════════════
const GameOverModal = ({ players, history, onReset }) => {
  const p0 = players[0];
  const p1 = players[1];
  const p0name = p0.name || 'Player 1';
  const p1name = p1.name || 'Player 2';

  const winner = p0.score > p1.score ? p0 : p1.score > p0.score ? p1 : null;
  const winnerName = winner === p0 ? p0name : winner === p1 ? p1name : null;

  const stat = (playerIdx, action) => history.filter(h => h.player === playerIdx && h.action === action).length;
  const maxBreak = (playerIdx) => {
    let mx = 0, run = 0;
    [...history].reverse().forEach(h => {
      if (h.player === playerIdx && h.action === 'pot') { run += h.points; mx = Math.max(mx, run); }
      else if (h.player === playerIdx) run = 0;
    });
    return mx;
  };

  const stats = [
    [p0name, p0.score, stat(0, 'pot'), stat(0, 'foul'), maxBreak(0)],
    [p1name, p1.score, stat(1, 'pot'), stat(1, 'foul'), maxBreak(1)],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.94)',
        backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.78, y: 70 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        style={{
          background: 'rgba(6,8,16,0.99)',
          border: `1px solid ${T.borderCyan}`,
          borderRadius: 24,
          padding: 32,
          width: '100%',
          maxWidth: 420,
          boxShadow: `0 0 80px rgba(0,212,255,0.12), 0 40px 100px rgba(0,0,0,0.8)`,
          textAlign: 'center',
        }}
      >
        {/* Trophy */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,171,0,0.1)',
          border: '1px solid rgba(255,171,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Icon name="trophy" size={26} color={T.amber} />
        </div>

        <div style={{ fontSize: 10, letterSpacing: 5, color: T.text3, textTransform: 'uppercase', marginBottom: 6 }}>
          MATCH COMPLETE
        </div>

        {winner ? (
          <>
            <div style={{
              fontFamily: "'Rajdhani', monospace",
              fontSize: 32, fontWeight: 900, color: T.cyan, letterSpacing: -1, marginBottom: 2,
            }}>
              {winnerName}
            </div>
            <div style={{ fontSize: 11, color: T.text3, letterSpacing: 2, marginBottom: 28 }}>
              WINS THE MATCH
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Rajdhani', monospace", fontSize: 32, fontWeight: 900, color: T.amber, marginBottom: 2 }}>
              DRAW
            </div>
            <div style={{ fontSize: 11, color: T.text3, letterSpacing: 2, marginBottom: 28 }}>EQUAL SCORES</div>
          </>
        )}

        {/* Score comparison */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {stats.map(([name, score, pots, fouls, mb], i) => (
            <div key={i} style={{
              flex: 1,
              background: (i === 0 ? p0 : p1) === winner ? 'rgba(0,212,255,0.07)' : T.glass1,
              border: `1px solid ${(i === 0 ? p0 : p1) === winner ? T.borderCyan : T.border}`,
              borderRadius: 16, padding: '18px 12px',
            }}>
              <div style={{ fontSize: 9, color: T.text3, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{name}</div>
              <div style={{
                fontFamily: "'Rajdhani', monospace",
                fontSize: 48, fontWeight: 900, lineHeight: 1,
                color: (i === 0 ? p0 : p1) === winner ? T.cyan : T.text1,
              }}>
                {score}
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[['Pots', pots], ['Fouls', fouls], ['Top Run', mb]].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: T.text3 }}>{lbl}</span>
                    <span style={{ color: T.text2, fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* New match button */}
        <NewMatchButton onClick={onReset} />
      </motion.div>
    </motion.div>
  );
};

const NewMatchButton = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '16px',
        background: hovered
          ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.12))'
          : 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.06))',
        border: `1px solid ${hovered ? T.cyan : T.borderCyan}`,
        borderRadius: 14,
        color: hovered ? T.cyan : T.text2,
        fontSize: 14, fontWeight: 800,
        letterSpacing: 3, textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: hovered ? `0 0 30px rgba(0,212,255,0.2)` : `0 0 16px rgba(0,212,255,0.08)`,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
      }}
    >
      New Match
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SETUP SCREEN
// ═══════════════════════════════════════════════════════════════
const SetupScreen = ({ players, onNameChange, onStart }) => {
  const [focused, setFocused] = useState(null);
  const [btnHovered, setBtnHovered] = useState(false);

  const inputStyle = (i) => ({
    width: '100%',
    padding: '14px 16px',
    background: focused === i ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused === i ? T.borderCyan : T.border}`,
    borderRadius: 12,
    color: T.text1,
    fontSize: 16,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focused === i ? `0 0 0 3px rgba(0,212,255,0.08)` : 'none',
    transition: 'all 0.22s ease',
    letterSpacing: 0.3,
  });

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      minHeight: 0,
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(0,212,255,0.04) 0%, transparent 70%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        <GlassPanel style={{ padding: 32 }}>
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 9, letterSpacing: 6, color: T.text3, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
              ELITE FORMAT
            </div>
            <div style={{
              fontFamily: "'Rajdhani', monospace",
              fontSize: 34, fontWeight: 900, letterSpacing: -1,
              color: T.text1,
              lineHeight: 1,
            }}>
              <span style={{ color: T.cyan }}>SHOOT</span>
              {' '}
              <span style={{ color: T.text1 }}>OUT</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 4, letterSpacing: 1 }}>
              Snooker Referee Assistant
            </div>
            <div style={{
              width: 48, height: 2, margin: '14px auto 0',
              background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`,
              borderRadius: 1,
            }} />
          </div>

          {/* Player inputs */}
          {[0, 1].map(i => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, letterSpacing: 3, color: T.text3,
                textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
              }}>
                Player {i + 1}
              </div>
              <input
                type="text"
                placeholder={`Enter player ${i + 1} name`}
                value={players[i].name}
                onChange={e => onNameChange(i, e.target.value)}
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused(null)}
                style={inputStyle(i)}
              />
            </div>
          ))}

          {/* Match info pills */}
          <div style={{
            background: 'rgba(0,212,255,0.04)',
            border: `1px solid rgba(0,212,255,0.1)`,
            borderRadius: 12, padding: '12px 16px',
            marginBottom: 28, marginTop: 4,
            display: 'flex', justifyContent: 'space-around',
          }}>
            {[['Duration', '10 min'], ['Shot Clock', '15s → 10s'], ['Format', 'Shoot Out']].map(([lbl, val]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, letterSpacing: 2, color: T.text3, textTransform: 'uppercase', fontWeight: 700 }}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.cyan, marginTop: 3, fontFamily: "'Rajdhani', monospace" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={onStart}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              width: '100%', padding: '17px',
              background: btnHovered
                ? 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.12))'
                : 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,212,255,0.06))',
              border: `1px solid ${btnHovered ? T.green : T.borderGreen}`,
              borderRadius: 14,
              color: btnHovered ? T.green : T.text2,
              fontSize: 15, fontWeight: 800,
              letterSpacing: 4, textTransform: 'uppercase',
              cursor: 'pointer',
              transform: btnHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: btnHovered ? `0 0 30px rgba(0,255,136,0.18)` : `0 0 14px rgba(0,255,136,0.06)`,
              transition: 'all 0.22s ease',
            }}
          >
            Begin Match
          </button>
        </GlassPanel>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  CONTROL BUTTON
// ═══════════════════════════════════════════════════════════════
const CtrlBtn = ({ icon, label, onClick, color = T.text2, disabled }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: hov ? `${color}15` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, padding: '10px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        color: hov ? color : T.text3,
        transition: 'all 0.2s ease',
        minWidth: 64,
      }}
    >
      <Icon name={icon} size={18} color={hov ? color : T.text3} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
};

const ActionBtn = ({ icon, label, onClick, color = T.red }) => {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: hov ? `${color}18` : `${color}08`,
        border: `1px solid ${hov ? color + '70' : color + '25'}`,
        borderRadius: 14, padding: '14px 10px',
        cursor: 'pointer',
        flex: 1,
        color: hov ? color : color + 'aa',
        transform: pressed ? 'scale(0.94)' : hov ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hov ? `0 0 20px ${color}20` : 'none',
        transition: 'all 0.17s ease',
      }}
    >
      <Icon name={icon} size={20} color={hov ? color : color + 'aa'} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {label}
      </span>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
//  MATCH TIMER DISPLAY
// ═══════════════════════════════════════════════════════════════
const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const MatchTimerDisplay = ({ seconds }) => {
  const isLow    = seconds <= 120 && seconds > 60;
  const isCrit   = seconds <= 60;
  const color    = isCrit ? T.red : isLow ? T.amber : T.text2;
  const anim     = isCrit ? 'pulseRed 0.6s ease-in-out infinite alternate' : 'none';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: isCrit ? T.red : isLow ? T.amber : T.cyan, boxShadow: `0 0 6px ${color}` }} />
      <span style={{
        fontFamily: "'Rajdhani', monospace",
        fontSize: 20, fontWeight: 800, letterSpacing: -0.5,
        color, animation: anim, transition: 'color 0.3s ease',
      }}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  MAIN GAME SCREEN
// ═══════════════════════════════════════════════════════════════
const GameScreen = () => {
  const [players,            setPlayers]            = useState([{ name: '', score: 0 }, { name: '', score: 0 }]);
  const [prevScores,         setPrevScores]         = useState([0, 0]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [matchTimer,         setMatchTimer]         = useState(600);
  const [shotTimeLimit,      setShotTimeLimit]      = useState(15);
  const [shotTimer,          setShotTimer]          = useState(15);
  const [isGameActive,       setIsGameActive]       = useState(false);
  const [isPaused,           setIsPaused]           = useState(false);
  const [history,            setHistory]            = useState([]);
  const [redsRemaining,      setRedsRemaining]      = useState(15);
  const [isNextBallColor,    setIsNextBallColor]    = useState(false);
  const [inFinalSequence,    setInFinalSequence]    = useState(false);
  const [nextFinalColorIdx,  setNextFinalColorIdx]  = useState(0);
  const [foulModalVisible,   setFoulModalVisible]   = useState(false);
  const [gameOverVisible,    setGameOverVisible]    = useState(false);
  const [showAlertBanner,    setShowAlertBanner]    = useState(false);
  const [hasPlayed5min,      setHasPlayed5min]      = useState(false);

  const isProcessing = useRef(false);
  const handleFoulRef = useRef(null);

  // ─── Utility ────────────────────────────────────────────────
  const addHistory = useCallback((entry) => {
    setHistory(prev => [entry, ...prev]);
  }, []);

  const resetShotTimer = useCallback((limit) => {
    setShotTimer(limit !== undefined ? limit : shotTimeLimit);
  }, [shotTimeLimit]);

  // ─── Foul penalty calculation ────────────────────────────────
  const currentPenalty = () => {
    if (inFinalSequence) {
      const key = FINAL_COLORS[nextFinalColorIdx];
      if (key) return Math.max(4, BALLS[key].points);
    }
    return 4;
  };

  // ─── Switch player ───────────────────────────────────────────
  const switchPlayer = useCallback((newLimit) => {
    setCurrentPlayerIndex(prev => (prev + 1) % 2);
    setShotTimer(newLimit !== undefined ? newLimit : shotTimeLimit);
  }, [shotTimeLimit]);

  // ─── Handle foul ─────────────────────────────────────────────
  const handleFoul = useCallback((foulType) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const opponentIdx = (currentPlayerIndex + 1) % 2;
    let penalty = 4;
    if (inFinalSequence) {
      const key = FINAL_COLORS[nextFinalColorIdx];
      if (key) penalty = Math.max(4, BALLS[key].points);
    }

    setPrevScores(prev => { const n = [...prev]; n[opponentIdx] = players[opponentIdx].score; return n; });
    setPlayers(prev => prev.map((p, i) =>
      i === opponentIdx ? { ...p, score: p.score + penalty } : p
    ));
    addHistory({ player: currentPlayerIndex, action: 'foul', reason: foulType.label, points: penalty });
    setFoulModalVisible(false);
    switchPlayer();

    setTimeout(() => { isProcessing.current = false; }, 150);
  }, [currentPlayerIndex, inFinalSequence, nextFinalColorIdx, players, addHistory, switchPlayer]);

  // Keep ref fresh every render so the shot timer effect can call it
  handleFoulRef.current = handleFoul;

  // ─── Match timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!isGameActive || isPaused || matchTimer <= 0) return;
    const id = setInterval(() => {
      setMatchTimer(prev => {
        const next = prev - 1;
        if (next <= 0) { endGame(); return 0; }
        if (next === 300 && !hasPlayed5min) {
          AudioManager.playBeep(800, 400, 1.0);
          setTimeout(() => AudioManager.playBeep(800, 400, 1.0), 600);
          setHasPlayed5min(true);
          setShotTimeLimit(10);
          setShotTimer(10);
          setShowAlertBanner(true);
          setTimeout(() => setShowAlertBanner(false), 5000);
        }
        if (next === 120) {
          AudioManager.playBeep(800, 400, 1.0);
          setTimeout(() => AudioManager.playBeep(800, 400, 1.0), 600);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameActive, isPaused, matchTimer, hasPlayed5min]);

  // ─── Shot timer (one-tick-at-a-time pattern) ─────────────────
  useEffect(() => {
    if (!isGameActive || isPaused || shotTimer <= 0) return;
    const id = setTimeout(() => {
      setShotTimer(prev => {
        const next = prev - 1;
        if (next <= 5 && next > 0) AudioManager.playCountdownSound(next);
        return next;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [isGameActive, isPaused, shotTimer]);

  // Handle shot timer expiry
  useEffect(() => {
    if (shotTimer === 0 && isGameActive && !isPaused) {
      handleFoulRef.current(FOUL_TYPES[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotTimer, isGameActive, isPaused]);

  // ─── Name change ─────────────────────────────────────────────
  const handleNameChange = (index, name) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name } : p));
  };

  // ─── Handle pot ──────────────────────────────────────────────
  const handlePot = useCallback((ballKey) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const ball = BALLS[ballKey];

    // Final sequence: only the expected color
    if (inFinalSequence) {
      if (ballKey !== FINAL_COLORS[nextFinalColorIdx]) {
        isProcessing.current = false;
        return;
      }
      setPrevScores(prev => { const n = [...prev]; n[currentPlayerIndex] = players[currentPlayerIndex].score; return n; });
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayerIndex ? { ...p, score: p.score + ball.points } : p
      ));
      addHistory({ player: currentPlayerIndex, action: 'pot', ball: ball.name, points: ball.points });
      resetShotTimer();

      const nextIdx = nextFinalColorIdx + 1;
      if (nextIdx >= FINAL_COLORS.length) {
        setTimeout(() => endGame(), 200);
      } else {
        setNextFinalColorIdx(nextIdx);
      }
      setTimeout(() => { isProcessing.current = false; }, 150);
      return;
    }

    // Free-choice color after last red (redsRemaining === 0, isNextBallColor === true)
    if (redsRemaining === 0 && isNextBallColor) {
      const colorKeys = ['YELLOW', 'GREEN', 'BROWN', 'BLUE', 'PINK', 'BLACK'];
      if (!colorKeys.includes(ballKey)) { isProcessing.current = false; return; }
      setPrevScores(prev => { const n = [...prev]; n[currentPlayerIndex] = players[currentPlayerIndex].score; return n; });
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayerIndex ? { ...p, score: p.score + ball.points } : p
      ));
      addHistory({ player: currentPlayerIndex, action: 'pot', ball: ball.name, points: ball.points });
      resetShotTimer();
      // Now enter the final locked sequence
      setIsNextBallColor(false);
      setInFinalSequence(true);
      setNextFinalColorIdx(0);
      setTimeout(() => { isProcessing.current = false; }, 150);
      return;
    }

    // Normal red
    if (ballKey === 'RED' && !isNextBallColor) {
      setPrevScores(prev => { const n = [...prev]; n[currentPlayerIndex] = players[currentPlayerIndex].score; return n; });
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayerIndex ? { ...p, score: p.score + ball.points } : p
      ));
      addHistory({ player: currentPlayerIndex, action: 'pot', ball: ball.name, points: ball.points });
      resetShotTimer();
      setRedsRemaining(prev => prev - 1);
      setIsNextBallColor(true);
      setTimeout(() => { isProcessing.current = false; }, 150);
      return;
    }

    // Normal color after red
    if (isNextBallColor && ballKey !== 'RED') {
      setPrevScores(prev => { const n = [...prev]; n[currentPlayerIndex] = players[currentPlayerIndex].score; return n; });
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayerIndex ? { ...p, score: p.score + ball.points } : p
      ));
      addHistory({ player: currentPlayerIndex, action: 'pot', ball: ball.name, points: ball.points });
      resetShotTimer();
      setIsNextBallColor(false);
      setTimeout(() => { isProcessing.current = false; }, 150);
      return;
    }

    isProcessing.current = false;
  }, [currentPlayerIndex, inFinalSequence, isNextBallColor, nextFinalColorIdx, players, redsRemaining, addHistory, resetShotTimer]);

  // ─── Handle miss ─────────────────────────────────────────────
  const handleMiss = useCallback(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    addHistory({ player: currentPlayerIndex, action: 'miss' });
    if (!inFinalSequence) setIsNextBallColor(false);
    switchPlayer();
    setTimeout(() => { isProcessing.current = false; }, 150);
  }, [currentPlayerIndex, inFinalSequence, addHistory, switchPlayer]);

  // ─── Undo ────────────────────────────────────────────────────
  const undoLastAction = useCallback(() => {
    if (history.length === 0) return;
    const last = history[0];
    const rest = history.slice(1);

    if (last.action === 'pot') {
      setPlayers(prev => prev.map((p, i) =>
        i === last.player ? { ...p, score: p.score - last.points } : p
      ));
      if (last.ball === 'Red') {
        setRedsRemaining(prev => prev + 1);
        setIsNextBallColor(false);
        setInFinalSequence(false);
      } else {
        // Was a color pot
        if (inFinalSequence) {
          if (nextFinalColorIdx === 0) {
            // Undo the free-choice color (go back before final sequence)
            setInFinalSequence(false);
            setIsNextBallColor(true);
            setRedsRemaining(0);
          } else {
            setNextFinalColorIdx(prev => prev - 1);
          }
        } else if (redsRemaining === 0 && !isNextBallColor) {
          // This was the free-choice color after last red
          setInFinalSequence(false);
          setIsNextBallColor(true);
        } else {
          setIsNextBallColor(true);
        }
      }
    } else if (last.action === 'foul') {
      const oppIdx = (last.player + 1) % 2;
      setPlayers(prev => prev.map((p, i) =>
        i === oppIdx ? { ...p, score: p.score - last.points } : p
      ));
      setCurrentPlayerIndex(last.player);
      setShotTimer(shotTimeLimit);
    } else if (last.action === 'miss') {
      setCurrentPlayerIndex(last.player);
      setShotTimer(shotTimeLimit);
    }

    setHistory(rest);
  }, [history, inFinalSequence, isNextBallColor, nextFinalColorIdx, redsRemaining, shotTimeLimit]);

  // ─── Game lifecycle ──────────────────────────────────────────
  const startGame = () => {
    AudioManager.init();
    setIsGameActive(true);
    setIsPaused(false);
    setShotTimer(15);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const endGame = () => {
    setIsGameActive(false);
    setIsPaused(true);
    setGameOverVisible(true);
  };

  const resetGame = () => {
    setPlayers([{ name: '', score: 0 }, { name: '', score: 0 }]);
    setPrevScores([0, 0]);
    setCurrentPlayerIndex(0);
    setMatchTimer(600);
    setShotTimeLimit(15);
    setShotTimer(15);
    setIsGameActive(false);
    setIsPaused(false);
    setHistory([]);
    setRedsRemaining(15);
    setIsNextBallColor(false);
    setInFinalSequence(false);
    setNextFinalColorIdx(0);
    setGameOverVisible(false);
    setShowAlertBanner(false);
    setHasPlayed5min(false);
    isProcessing.current = false;
  };

  // ─── Ball availability logic ─────────────────────────────────
  const isRedDisabled  = isNextBallColor || inFinalSequence || redsRemaining === 0;
  const isColorDisabled = (key) => {
    if (inFinalSequence) return key !== FINAL_COLORS[nextFinalColorIdx];
    if (redsRemaining === 0 && isNextBallColor) return false; // free choice
    if (isNextBallColor) return false;
    return true; // waiting for red
  };

  // ─── Setup screen ────────────────────────────────────────────
  const isSetup = !isGameActive && history.length === 0;

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', height: '100%',
      background: T.bg0,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: T.text1,
    }}>
      {/* Ambient background layers */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          `radial-gradient(ellipse 100% 50% at 50% 0%, rgba(0,212,255,0.05) 0%, transparent 60%)`,
          `radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0,255,136,0.03) 0%, transparent 50%)`,
          `radial-gradient(ellipse 60% 40% at 80% 80%, rgba(191,90,242,0.025) 0%, transparent 50%)`,
        ].join(', '),
      }} />

      {/* 5-min alert banner */}
      <AnimatePresence>
        {showAlertBanner && (
          <motion.div
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
              background: 'linear-gradient(90deg, rgba(255,171,0,0.92), rgba(255,45,85,0.92))',
              backdropFilter: 'blur(12px)',
              padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
              borderBottom: '1px solid rgba(255,171,0,0.4)',
            }}
          >
            <Icon name="alert" size={16} color="#000" />
            <span style={{ color: '#000', fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>
              SHOT CLOCK NOW 10 SECONDS
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {foulModalVisible && (
          <FoulModal
            onSelect={handleFoul}
            onClose={() => setFoulModalVisible(false)}
            penaltyPoints={currentPenalty()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameOverVisible && (
          <GameOverModal
            players={players}
            history={history}
            onReset={resetGame}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center',
        padding: '16px 20px 12px',
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(20px)',
        background: 'rgba(6,8,16,0.8)',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Rajdhani', monospace",
            fontSize: 15, fontWeight: 900, letterSpacing: 2,
            color: T.text1, textTransform: 'uppercase',
          }}>
            <span style={{ color: T.cyan }}>Shoot</span> Out
          </div>
          <div style={{ fontSize: 9, color: T.text3, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>
            Snooker Referee
          </div>
        </div>

        {isGameActive && (
          <MatchTimerDisplay seconds={matchTimer} />
        )}

        {isGameActive && (
          <div style={{
            flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
            gap: 6,
          }}>
            <div style={{
              fontSize: 9, letterSpacing: 2, color: T.text3, textTransform: 'uppercase', fontWeight: 700,
            }}>
              REDS
            </div>
            <div style={{
              fontFamily: "'Rajdhani', monospace",
              fontSize: 18, fontWeight: 900, color: inFinalSequence ? T.amber : redsRemaining === 0 ? T.amber : T.text2,
            }}>
              {inFinalSequence ? 'FINAL' : redsRemaining}
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      {isSetup ? (
        <SetupScreen
          players={players}
          onNameChange={handleNameChange}
          onStart={startGame}
        />
      ) : (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '14px 14px 0',
          gap: 12,
          position: 'relative', zIndex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}>

          {/* ── SCORE CARDS ── */}
          <div style={{ display: 'flex', gap: 10 }}>
            {players.map((player, idx) => (
              <ScoreCard
                key={idx}
                index={idx}
                player={player}
                isActive={currentPlayerIndex === idx}
                previousScore={prevScores[idx]}
              />
            ))}
          </div>

          {/* ── SHOT CLOCK ── */}
          <GlassPanel style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <ShotClock
              timeLeft={shotTimer}
              totalTime={shotTimeLimit}
              isPaused={isPaused}
            />
            <StatusBadge
              redsRemaining={redsRemaining}
              isNextBallColor={isNextBallColor}
              inFinalSequence={inFinalSequence}
              nextFinalColorIndex={nextFinalColorIdx}
            />
          </GlassPanel>

          {/* ── BALLS GRID ── */}
          <GlassPanel style={{ padding: '18px 12px' }}>
            {/* Red ball */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              marginBottom: 8,
              paddingBottom: 14,
              borderBottom: `1px solid ${T.border}`,
            }}>
              <SnookerBall
                ballKey="RED"
                onClick={() => handlePot('RED')}
                disabled={isRedDisabled || !isGameActive}
                size={72}
              />
            </div>

            {/* Color balls */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', paddingTop: 4 }}>
              {FINAL_COLORS.map(key => (
                <SnookerBall
                  key={key}
                  ballKey={key}
                  onClick={() => handlePot(key)}
                  disabled={isColorDisabled(key) || !isGameActive}
                  size={60}
                />
              ))}
            </div>

            {/* Final sequence indicator */}
            {inFinalSequence && (
              <div style={{
                marginTop: 10,
                display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
              }}>
                {FINAL_COLORS.map((key, i) => (
                  <div key={key} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < nextFinalColorIdx
                      ? 'rgba(255,255,255,0.15)'
                      : i === nextFinalColorIdx
                        ? T.amber
                        : 'rgba(255,255,255,0.05)',
                    boxShadow: i === nextFinalColorIdx ? `0 0 8px ${T.amber}` : 'none',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
            )}
          </GlassPanel>

          {/* ── ACTION BUTTONS ── */}
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionBtn
              icon="foul"
              label="Foul"
              color={T.red}
              onClick={() => setFoulModalVisible(true)}
            />
            <ActionBtn
              icon="skip"
              label="Miss"
              color={T.cyan}
              onClick={handleMiss}
            />
            <ActionBtn
              icon="undo"
              label="Undo"
              color={T.amber}
              onClick={undoLastAction}
            />
          </div>

          {/* ── CONTROLS ── */}
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center',
            paddingBottom: 14,
            flexWrap: 'wrap',
          }}>
            {isPaused ? (
              <CtrlBtn icon="play"  label="Resume" onClick={handleResume} color={T.green} />
            ) : (
              <CtrlBtn icon="pause" label="Pause"  onClick={handlePause}  color={T.amber} />
            )}
            <CtrlBtn icon="reset" label="Restart" onClick={resetGame} color={T.red} />
          </div>

        </div>
      )}
    </div>
  );
};

export default GameScreen;
