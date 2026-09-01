import React, { useMemo } from 'react';
import './WelcomePage.css';

interface WelcomePageProps {
  onLogin: () => void;
  onSignup: () => void;
}

/**
 * Generates random star data (position, size, animation timing).
 * Memoized so stars don't re-randomize on re-render.
 */
const useStars = (count: number) =>
  useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 4 + 3}s`,
      delay: `${Math.random() * 5}s`,
      maxOpacity: Math.random() * 0.6 + 0.2,
    })),
  [count]);

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin, onSignup }) => {
  const stars = useStars(60);

  return (
    <div className="welcome-container">
      {/* ── Animated Starfield ── */}
      <div className="stars">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              '--duration': s.duration,
              '--max-opacity': s.maxOpacity,
              animationDelay: s.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Ambient Glow Orbs ── */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* ── Logo Badge ── */}
      <div className="welcome-logo-wrapper">
        <div className="welcome-logo">
          ⚖️
        </div>
      </div>

      {/* ── Glassmorphic Card ── */}
      <div className="welcome-card">
        <div className="welcome-label">Welcome to</div>
        <h1 className="welcome-title">
          <span className="title-gradient">IP Docket Guard</span>
        </h1>
        <p className="welcome-tagline">
          Your <span className="tagline-highlight">AI-Powered</span> patent renewal tracking &amp; business value estimation platform.
        </p>

        <div className="welcome-buttons">
          <button className="btn-login" onClick={onLogin}>
            Login
          </button>
          <button className="btn-signup" onClick={onSignup}>
            Sign Up
          </button>
        </div>
      </div>

      {/* ── Feature Highlights ── */}
      <div className="welcome-features">
        <div className="feature-item">
          <span className="feature-icon">🔒</span>
          <span>Enterprise Security</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <span>Smart Alerts</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">📊</span>
          <span>AI Valuation</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
