// =============================================================================
// MIT License
// Copyright (c) 2026 Aparavi Software AG
// =============================================================================

/**
 * IP Docket Guard — Patent renewal tracking & business value estimation.
 * Full MVP: Dashboard, Docket Table, Smart Alerts, Sort/Filter.
 */

import React, { useState, useMemo } from 'react';
import type { ShellAppProps } from 'shell';
import { AppLayout } from 'shell';
import LoginPage from './LoginPage';
import WelcomePage from './WelcomePage';

// =============================================================================
// TYPES
// =============================================================================

type UrgencyLevel = 'critical' | 'warning' | 'safe';

interface Patent {
  id: string;
  patentId: string;
  clientName: string;
  renewalDate: string;
  businessValue: number;
  status: 'active' | 'pending' | 'lapsed';
}

type SortField = 'renewalDate' | 'businessValue' | 'patentId' | 'clientName';
type SortDir = 'asc' | 'desc';
type FilterUrgency = 'all' | 'critical' | 'warning' | 'safe';
type NavSection = 'welcome' | 'login' | 'dashboard' | 'docket' | 'clients' | 'reports';

// =============================================================================
// MOCK DATA
// =============================================================================

const today = new Date();
const daysFromNow = (days: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const MOCK_PATENTS: Patent[] = [
  { id: '1',  patentId: 'US-9,876,543',    clientName: 'Nexon Biotech Inc.',   renewalDate: daysFromNow(12),  businessValue: 4_200_000,  status: 'active'  },
  { id: '2',  patentId: 'EP-3,456,789',    clientName: 'AlphaCore Systems',    renewalDate: daysFromNow(7),   businessValue: 8_750_000,  status: 'active'  },
  { id: '3',  patentId: 'US-10,123,456',   clientName: 'Veltric Pharma',       renewalDate: daysFromNow(22),  businessValue: 12_500_000, status: 'active'  },
  { id: '4',  patentId: 'WO-2024/098765',  clientName: 'Orbis Dynamics',       renewalDate: daysFromNow(45),  businessValue: 3_100_000,  status: 'active'  },
  { id: '5',  patentId: 'US-8,654,321',    clientName: 'Nexon Biotech Inc.',   renewalDate: daysFromNow(60),  businessValue: 1_800_000,  status: 'pending' },
  { id: '6',  patentId: 'EP-2,987,654',    clientName: 'Lumos Technologies',   renewalDate: daysFromNow(75),  businessValue: 6_600_000,  status: 'active'  },
  { id: '7',  patentId: 'US-11,234,567',   clientName: 'Meridian Labs',        renewalDate: daysFromNow(120), businessValue: 9_900_000,  status: 'active'  },
  { id: '8',  patentId: 'CN-108765432',    clientName: 'AlphaCore Systems',    renewalDate: daysFromNow(150), businessValue: 2_300_000,  status: 'active'  },
  { id: '9',  patentId: 'US-7,890,123',    clientName: 'Veltric Pharma',       renewalDate: daysFromNow(200), businessValue: 15_000_000, status: 'active'  },
  { id: '10', patentId: 'EP-4,111,222',    clientName: 'Solara Energy',        renewalDate: daysFromNow(18),  businessValue: 5_400_000,  status: 'active'  },
  { id: '11', patentId: 'US-12,345,678',   clientName: 'Solara Energy',        renewalDate: daysFromNow(88),  businessValue: 7_200_000,  status: 'pending' },
  { id: '12', patentId: 'WO-2025/012345',  clientName: 'Meridian Labs',        renewalDate: daysFromNow(310), businessValue: 3_800_000,  status: 'active'  },
];

// =============================================================================
// HELPERS
// =============================================================================

const getDaysUntil = (dateStr: string): number => {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getUrgency = (dateStr: string): UrgencyLevel => {
  const days = getDaysUntil(dateStr);
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'safe';
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const C = {
  bg:             '#0d1117',
  surface:        '#161b22',
  surfaceAlt:     '#1c2128',
  border:         '#30363d',
  borderSubtle:   '#21262d',
  textPrimary:    '#e6edf3',
  textSecondary:  '#8b949e',
  textMuted:      '#484f58',
  accent:         '#388bfd',
  accentGlow:     'rgba(56,139,253,0.12)',
  critical:       '#f85149',
  criticalBg:     'rgba(248,81,73,0.08)',
  criticalBorder: 'rgba(248,81,73,0.3)',
  warning:        '#d29922',
  warningBg:      'rgba(210,153,34,0.08)',
  warningBorder:  'rgba(210,153,34,0.3)',
  safe:           '#3fb950',
  safeBg:         'rgba(63,185,80,0.08)',
  safeBorder:     'rgba(63,185,80,0.3)',
  gold:           '#ffd700',
};

// =============================================================================
// ATOMIC COMPONENTS
// =============================================================================

const Badge: React.FC<{ color: string; bg: string; border: string; children: React.ReactNode }> = ({ color, bg, border, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px',
    background: bg, border: `1px solid ${border}`, borderRadius: 20,
    fontSize: 11, fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase' as const,
  }}>
    {children}
  </span>
);

const MetricCard: React.FC<{ label: string; value: string | number; sub?: string; accent?: string; icon: string }> = ({
  label, value, sub, accent = C.accent, icon,
}) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '20px 24px', flex: 1, minWidth: 170, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary, lineHeight: 1, marginBottom: 6 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.textMuted }}>{sub}</div>}
  </div>
);

const UrgencyDot: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  const clr = { critical: C.critical, warning: C.warning, safe: C.safe }[urgency];
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: clr, marginRight: 8, flexShrink: 0,
      boxShadow: `0 0 5px ${clr}`,
    }} />
  );
};

// =============================================================================
// TOOLBAR
// =============================================================================

const Toolbar: React.FC<{
  sortField: SortField; sortDir: SortDir;
  filterUrgency: FilterUrgency; search: string;
  onSort: (f: SortField) => void;
  onFilterUrgency: (f: FilterUrgency) => void;
  onSearch: (v: string) => void;
}> = ({ sortField, sortDir, filterUrgency, search, onSort, onFilterUrgency, onSearch }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const,
    padding: '12px 20px', background: C.surfaceAlt, borderBottom: `1px solid ${C.border}`,
  }}>
    {/* Search */}
    <div style={{ position: 'relative' as const, flex: '1 1 200px', minWidth: 180 }}>
      <span style={{ position: 'absolute' as const, left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, fontSize: 13 }}>🔍</span>
      <input
        type="text" placeholder="Search patent or client…" value={search}
        onChange={e => onSearch(e.target.value)}
        style={{
          width: '100%', padding: '7px 10px 7px 30px',
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
        }}
      />
    </div>

    {/* Urgency filter pills */}
    {(['all', 'critical', 'warning', 'safe'] as FilterUrgency[]).map(key => {
      const active = filterUrgency === key;
      const labelMap = { all: 'All', critical: '🔴 Critical', warning: '🟡 Warning', safe: '🟢 Safe' };
      const colorMap = { all: C.textSecondary, critical: C.critical, warning: C.warning, safe: C.safe };
      return (
        <button key={key} onClick={() => onFilterUrgency(key)} style={{
          padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: active ? `${colorMap[key]}20` : 'transparent',
          color: active ? colorMap[key] : C.textMuted,
          border: `1px solid ${active ? colorMap[key] + '50' : 'transparent'}`,
          transition: 'all 0.15s',
        }}>
          {labelMap[key]}
        </button>
      );
    })}

    {/* Sort buttons */}
    <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: C.textMuted }}>Sort:</span>
      {([['renewalDate', '📅 Deadline'], ['businessValue', '💰 Value'], ['clientName', 'Client']] as [SortField, string][]).map(([field, label]) => {
        const active = sortField === field;
        return (
          <button key={field} onClick={() => onSort(field)} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: active ? C.accent : C.surface,
            color: active ? '#fff' : C.textSecondary,
            border: `1px solid ${active ? C.accent : C.border}`,
            transition: 'all 0.15s',
          }}>
            {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
          </button>
        );
      })}
    </div>
  </div>
);

// =============================================================================
// DOCKET TABLE
// =============================================================================

const DocketTable: React.FC<{ patents: Patent[] }> = ({ patents }) => {
  const thStyle: React.CSSProperties = {
    padding: '11px 16px', textAlign: 'left' as const, fontSize: 11,
    color: C.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt, whiteSpace: 'nowrap' as const,
  };
  const tdStyle: React.CSSProperties = {
    padding: '13px 16px', fontSize: 13, color: C.textPrimary,
    borderBottom: `1px solid ${C.borderSubtle}`, verticalAlign: 'middle' as const,
  };

  if (patents.length === 0)
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' as const, color: C.textMuted }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
        <div style={{ fontSize: 14 }}>No patents match current filters.</div>
      </div>
    );

  return (
    <div style={{ overflowX: 'auto' as const }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
        <thead>
          <tr>
            {['#', 'Patent ID', 'Client', 'Renewal Date', 'Days Left', 'Est. Business Value', 'Status', 'Actions'].map((h, i) => (
              <th key={i} style={{ ...thStyle, textAlign: (i === 7 ? 'center' : 'left') as 'center' | 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {patents.map((p, i) => {
            const urgency = getUrgency(p.renewalDate);
            const days = getDaysUntil(p.renewalDate);
            const urgClr = { critical: C.critical, warning: C.warning, safe: C.safe }[urgency];
            const urgBg = { critical: C.criticalBg, warning: C.warningBg, safe: 'transparent' }[urgency];
            const urgBdr = { critical: C.critical, warning: C.warning, safe: 'transparent' }[urgency];
            const stsClr: Record<string, string> = { active: C.safe, pending: C.warning, lapsed: C.critical };
            return (
              <tr key={p.id} style={{ background: urgBg, borderLeft: `3px solid ${urgBdr}` }}>
                <td style={{ ...tdStyle, color: C.textMuted, fontSize: 12 }}>{i + 1}</td>
                <td style={tdStyle}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <UrgencyDot urgency={urgency} />
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{p.patentId}</span>
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{p.clientName}</td>
                <td style={tdStyle}>{formatDate(p.renewalDate)}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    color: urgClr, background: `${urgClr}18`,
                    border: `1px solid ${urgClr}40`,
                  }}>{days}d</span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(p.businessValue)}</td>
                <td style={tdStyle}>
                  <Badge color={stsClr[p.status]} bg={`${stsClr[p.status]}15`} border={`${stsClr[p.status]}35`}>
                    {p.status}
                  </Badge>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.accent}30`, background: `${C.accent}15`, color: C.accent }}>🔄 Renew</button>
                    <button style={{ padding: '4px 8px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.textSecondary }}>👁</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// =============================================================================
// SIDEBAR NAV
// =============================================================================

const SidebarNav: React.FC<{ active: NavSection; onNav: (s: NavSection) => void; onLogout: () => void }> = ({ active, onNav, onLogout }) => {
  const items: Array<{ key: NavSection; icon: string; label: string }> = [
    { key: 'welcome',   icon: '✨', label: 'Welcome Page' },
    { key: 'login',     icon: '🔑', label: 'Login / Sign Up' },
    { key: 'dashboard', icon: '⬛', label: 'Dashboard' },
    { key: 'docket',    icon: '📋', label: 'Docket'    },
    { key: 'clients',   icon: '🏢', label: 'Clients'   },
    { key: 'reports',   icon: '📊', label: 'Reports'   },
  ];
  const critCount = MOCK_PATENTS.filter(p => getUrgency(p.renewalDate) === 'critical').length;

  return (
    <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ padding: '10px 12px 12px', marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Navigation</div>
      </div>
      {items.map(({ key, icon, label }) => {
        const isActive = active === key;
        return (
          <div
            key={key}
            onClick={() => onNav(key)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              background: isActive ? C.accentGlow : 'transparent',
              color: isActive ? C.accent : C.textSecondary,
              border: `1px solid ${isActive ? C.accent + '30' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{icon}</span>{label}
            </span>
            {key === 'docket' && critCount > 0 && (
              <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: C.criticalBg, color: C.critical, border: `1px solid ${C.criticalBorder}` }}>
                {critCount}
              </span>
            )}
          </div>
        );
      })}

      {/* Quick stats */}
      <div style={{ margin: '16px 12px 0', paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Quick Stats</div>
        {[
          { label: 'Total Patents', value: `${MOCK_PATENTS.length}`, color: C.textPrimary },
          { label: 'Active',   value: `${MOCK_PATENTS.filter(p => p.status === 'active').length}`,  color: C.safe    },
          { label: 'Pending',  value: `${MOCK_PATENTS.filter(p => p.status === 'pending').length}`, color: C.warning },
          { label: 'Critical', value: `${critCount}`, color: C.critical },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span>{label}</span>
            <span style={{ color, fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        style={{
          margin: '16px 6px 0',
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: C.surfaceAlt,
          color: C.textSecondary,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.15s',
        }}
      >
        🚪 Log Out / Welcome
      </button>
    </div>
  );
};

// =============================================================================
// DASHBOARD VIEW
// =============================================================================

const DashboardView: React.FC<{ onGoToDocket: () => void }> = ({ onGoToDocket }) => {
  const totalValue = MOCK_PATENTS.reduce((s, p) => s + p.businessValue, 0);
  const critical = MOCK_PATENTS.filter(p => getUrgency(p.renewalDate) === 'critical');
  const warning  = MOCK_PATENTS.filter(p => getUrgency(p.renewalDate) === 'warning');
  const safe     = MOCK_PATENTS.filter(p => getUrgency(p.renewalDate) === 'safe');
  const topByVal = [...MOCK_PATENTS].sort((a, b) => b.businessValue - a.businessValue).slice(0, 5);

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #388bfd, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>⚖️</div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>IP Docket Guard</h1>
          <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
            Patent Portfolio Management · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 20 }}>
        <MetricCard label="Total Portfolio Value"  value={formatCurrency(totalValue)} sub={`${MOCK_PATENTS.length} patents tracked`} accent={C.accent}    icon="💼" />
        <MetricCard label="Critical (< 30 days)"   value={critical.length}            sub="Immediate action required"              accent={C.critical}  icon="🚨" />
        <MetricCard label="Warning (< 90 days)"    value={warning.length}             sub="Schedule renewal soon"                  accent={C.warning}   icon="⚠️" />
        <MetricCard label="Safe (> 90 days)"       value={safe.length}                sub="No immediate action"                    accent={C.safe}      icon="✅" />
      </div>

      {/* Two-column panels */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, marginBottom: 16 }}>
        {/* Critical renewals */}
        <div style={{ flex: '1 1 300px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>🚨 Critical Renewals</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Due within 30 days</div>
            </div>
            <button onClick={onGoToDocket} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.accent }}>
              View All →
            </button>
          </div>
          {critical.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' as const, color: C.textMuted, fontSize: 13 }}>No critical renewals 🎉</div>
          ) : (
            critical.sort((a, b) => getDaysUntil(a.renewalDate) - getDaysUntil(b.renewalDate)).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${C.borderSubtle}`, background: C.criticalBg }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: C.textPrimary }}>{p.patentId}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.clientName}</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.critical }}>{getDaysUntil(p.renewalDate)}d left</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{formatDate(p.renewalDate)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top by value */}
        <div style={{ flex: '1 1 300px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>💰 Top 5 by Value</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Highest estimated business value</div>
          </div>
          {topByVal.map((p, i) => {
            const urgClr = { critical: C.critical, warning: C.warning, safe: C.safe }[getUrgency(p.renewalDate)];
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${C.borderSubtle}` }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? C.gold : C.textMuted, width: 18, textAlign: 'center' as const }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: C.textPrimary }}>{p.patentId}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.clientName}</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{formatCurrency(p.businessValue)}</div>
                  <div style={{ fontSize: 11, color: urgClr, fontWeight: 600 }}>{getDaysUntil(p.renewalDate)}d remaining</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgency bar */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>📊 Portfolio Urgency Overview</div>
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8, marginBottom: 10 }}>
          {[{ count: critical.length, color: C.critical }, { count: warning.length, color: C.warning }, { count: safe.length, color: C.safe }].map(({ count, color }, i) => (
            <div key={i} style={{ flex: count || 0, background: color, opacity: 0.8 }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: C.textMuted, flexWrap: 'wrap' as const }}>
          <span><span style={{ color: C.critical }}>●</span> Critical: {critical.length} ({Math.round(critical.length / MOCK_PATENTS.length * 100)}%)</span>
          <span><span style={{ color: C.warning }}>●</span> Warning: {warning.length} ({Math.round(warning.length / MOCK_PATENTS.length * 100)}%)</span>
          <span><span style={{ color: C.safe }}>●</span> Safe: {safe.length} ({Math.round(safe.length / MOCK_PATENTS.length * 100)}%)</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// DOCKET VIEW
// =============================================================================

const DocketView: React.FC = () => {
  const [sortField, setSortField] = useState<SortField>('renewalDate');
  const [sortDir,   setSortDir]   = useState<SortDir>('asc');
  const [filterUrgency, setFilterUrgency] = useState<FilterUrgency>('all');
  const [search, setSearch] = useState('');

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir(field === 'businessValue' ? 'desc' : 'asc'); }
  };

  const filtered = useMemo(() => {
    let data = [...MOCK_PATENTS];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p => p.patentId.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q));
    }
    if (filterUrgency !== 'all') data = data.filter(p => getUrgency(p.renewalDate) === filterUrgency);
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'renewalDate')    cmp = new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
      else if (sortField === 'businessValue') cmp = a.businessValue - b.businessValue;
      else if (sortField === 'clientName') cmp = a.clientName.localeCompare(b.clientName);
      else cmp = a.patentId.localeCompare(b.patentId);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [sortField, sortDir, filterUrgency, search]);

  const totalValue = filtered.reduce((s, p) => s + p.businessValue, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Patent Docket</h2>
          <p style={{ fontSize: 12, color: C.textMuted, margin: '2px 0 0' }}>
            {filtered.length} of {MOCK_PATENTS.length} patents · <strong style={{ color: C.textSecondary }}>{formatCurrency(totalValue)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.accent}`, background: C.accentGlow, color: C.accent }}>+ Add Patent</button>
          <button style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.textSecondary }}>⬇ Export CSV</button>
        </div>
      </div>

      <Toolbar sortField={sortField} sortDir={sortDir} filterUrgency={filterUrgency} search={search} onSort={handleSort} onFilterUrgency={setFilterUrgency} onSearch={setSearch} />

      <div style={{ flex: 1, overflowY: 'auto' as const }}>
        <DocketTable patents={filtered} />
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, background: C.surfaceAlt, display: 'flex', gap: 20, flexWrap: 'wrap' as const, fontSize: 12, color: C.textMuted }}>
        <span>🔴 <strong style={{ color: C.critical }}>{filtered.filter(p => getUrgency(p.renewalDate) === 'critical').length}</strong> Critical</span>
        <span>🟡 <strong style={{ color: C.warning }}>{filtered.filter(p => getUrgency(p.renewalDate) === 'warning').length}</strong> Warning</span>
        <span>🟢 <strong style={{ color: C.safe }}>{filtered.filter(p => getUrgency(p.renewalDate) === 'safe').length}</strong> Safe</span>
        <span style={{ marginLeft: 'auto' }}>Filtered value: <strong style={{ color: C.textPrimary }}>{formatCurrency(totalValue)}</strong></span>
      </div>
    </div>
  );
};

// =============================================================================
// CLIENT MANAGEMENT VIEW
// =============================================================================

interface ClientInfo {
  id: string;
  name: string;
  industry: string;
  contactEmail: string;
  accountManager: string;
  tier: 'Enterprise' | 'Premium' | 'Standard';
}

const MOCK_CLIENTS: ClientInfo[] = [
  { id: 'c1', name: 'Nexon Biotech Inc.', industry: 'Biotechnology', contactEmail: 'legal@nexonbiotech.com', accountManager: 'Sarah Jenkins', tier: 'Enterprise' },
  { id: 'c2', name: 'AlphaCore Systems', industry: 'AI & Semiconductors', contactEmail: 'ip@alphacore.io', accountManager: 'David Chen', tier: 'Enterprise' },
  { id: 'c3', name: 'Veltric Pharma', industry: 'Pharmaceuticals', contactEmail: 'patents@veltric.com', accountManager: 'Elena Rostova', tier: 'Enterprise' },
  { id: 'c4', name: 'Orbis Dynamics', industry: 'Aerospace & Robotics', contactEmail: 'ip-dept@orbisdynamics.com', accountManager: 'Michael Vance', tier: 'Premium' },
  { id: 'c5', name: 'Lumos Technologies', industry: 'Optics & Quantum', contactEmail: 'legal@lumostech.com', accountManager: 'David Chen', tier: 'Standard' },
  { id: 'c6', name: 'Meridian Labs', industry: 'Medical Devices', contactEmail: 'docketing@meridianlabs.org', accountManager: 'Sarah Jenkins', tier: 'Enterprise' },
  { id: 'c7', name: 'Solara Energy', industry: 'CleanTech & Solar', contactEmail: 'ip@solaraenergy.com', accountManager: 'Elena Rostova', tier: 'Premium' },
];

const ClientsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  const clientStats = useMemo(() => {
    return MOCK_CLIENTS.map(c => {
      const patents = MOCK_PATENTS.filter(p => p.clientName === c.name);
      const totalVal = patents.reduce((s, p) => s + p.businessValue, 0);
      const criticalCount = patents.filter(p => getUrgency(p.renewalDate) === 'critical').length;
      const warningCount = patents.filter(p => getUrgency(p.renewalDate) === 'warning').length;
      return {
        ...c,
        patentsCount: patents.length,
        totalValue: totalVal,
        criticalCount,
        warningCount,
      };
    });
  }, []);

  const filteredClients = useMemo(() => {
    return clientStats.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                            c.industry.toLowerCase().includes(search.toLowerCase()) ||
                            c.accountManager.toLowerCase().includes(search.toLowerCase());
      const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [clientStats, search, industryFilter]);

  const industries = Array.from(new Set(MOCK_CLIENTS.map(c => c.industry)));

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>🏢 Client Portfolio Management</h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0' }}>
            Manage corporate client accounts, track IP portfolio valuation, and monitor renewal urgency.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.accent}`, background: C.accentGlow, color: C.accent }}>
            + Add Client
          </button>
          <button style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.textSecondary }}>
            ⬇ Export Directory
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <MetricCard label="Total Clients" value={MOCK_CLIENTS.length} sub="Corporate Accounts" icon="🏢" accent={C.accent} />
        <MetricCard label="Total Valuation" value={formatCurrency(MOCK_PATENTS.reduce((s, p) => s + p.businessValue, 0))} sub="Across all clients" icon="💰" accent={C.safe} />
        <MetricCard label="Clients At Risk" value={clientStats.filter(c => c.criticalCount > 0).length} sub="Has critical deadlines" icon="🚨" accent={C.critical} />
        <MetricCard label="Avg Patents / Client" value={(MOCK_PATENTS.length / MOCK_CLIENTS.length).toFixed(1)} sub="Patents per organization" icon="📊" accent={C.warning} />
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search client, industry, manager…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 34px',
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, fontSize: 14 }}>🔍</span>
        </div>
        <select
          value={industryFilter}
          onChange={e => setIndustryFilter(e.target.value)}
          style={{
            padding: '8px 12px', background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">All Industries</option>
          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      {/* Clients Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {filteredClients.map(c => (
          <div key={c.id} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.criticalCount > 0 ? C.critical : c.warningCount > 0 ? C.warning : C.safe }} />
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>{c.name}</h3>
                  <span style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: C.accentGlow, padding: '2px 8px', borderRadius: 12, marginTop: 4, display: 'inline-block' }}>
                    {c.industry}
                  </span>
                </div>
                <Badge color={C.textSecondary} bg={C.surfaceAlt} border={C.border}>
                  {c.tier}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0', background: C.surfaceAlt, padding: 12, borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>PATENTS</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{c.patentsCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>PORTFOLIO VALUE</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{formatCurrency(c.totalValue)}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: C.textMuted, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                <div>📧 <span style={{ color: C.textSecondary }}>{c.contactEmail}</span></div>
                <div>👤 Manager: <span style={{ color: C.textSecondary }}>{c.accountManager}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${C.borderSubtle}` }}>
              <div>
                {c.criticalCount > 0 ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.critical }}>🚨 {c.criticalCount} Critical Deadline</span>
                ) : c.warningCount > 0 ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.warning }}>⚠️ {c.warningCount} Renewal Soon</span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.safe }}>✅ All Clear</span>
                )}
              </div>
              <button
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.accent }}
              >
                Manage Client →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// REPORTS & ANALYTICS VIEW
// =============================================================================

const ReportsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Q1 2026' | 'YTD' | '1Y' | 'ALL'>('YTD');

  const totalVal = MOCK_PATENTS.reduce((s, p) => s + p.businessValue, 0);
  const criticalVal = MOCK_PATENTS.filter(p => getUrgency(p.renewalDate) === 'critical').reduce((s, p) => s + p.businessValue, 0);
  const warningVal = MOCK_PATENTS.filter(p => getUrgency(p.renewalDate) === 'warning').reduce((s, p) => s + p.businessValue, 0);

  const clientDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_PATENTS.forEach(p => {
      map[p.clientName] = (map[p.clientName] || 0) + p.businessValue;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>📊 Reports & Valuation Analytics</h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0' }}>
            Comprehensive patent portfolio analytics, renewal risk forecasting, and financial breakdown.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 2 }}>
            {(['Q1 2026', 'YTD', '1Y', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: timeframe === tf ? C.accent : 'transparent',
                  color: timeframe === tf ? '#fff' : C.textMuted,
                }}
              >
                {tf}
              </button>
            ))}
          </div>
          <button style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.textPrimary }}>
            📥 Download PDF Report
          </button>
        </div>
      </div>

      {/* Metrics Highlights */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <MetricCard label="Total Portfolio Value" value={formatCurrency(totalVal)} sub="12 Monitored Patents" icon="💼" accent={C.accent} />
        <MetricCard label="Capital at Risk (<30d)" value={formatCurrency(criticalVal)} sub={`${Math.round((criticalVal / totalVal) * 100)}% of total value`} icon="🚨" accent={C.critical} />
        <MetricCard label="Warning Capital (<90d)" value={formatCurrency(warningVal)} sub={`${Math.round((warningVal / totalVal) * 100)}% of total value`} icon="⚠️" accent={C.warning} />
        <MetricCard label="Avg Patent Value" value={formatCurrency(totalVal / MOCK_PATENTS.length)} sub="Estimated IP Asset Value" icon="📈" accent={C.safe} />
      </div>

      {/* Executive Summary Card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          💡 AI Docket Intelligence Summary
        </div>
        <p style={{ fontSize: 14, color: C.textPrimary, lineHeight: 1.6, margin: 0 }}>
          Your portfolio currently holds <strong>{MOCK_PATENTS.length} active IP assets</strong> valued at <strong>{formatCurrency(totalVal)}</strong>. 
          There are <strong>4 critical renewals</strong> approaching within the next 30 days representing <strong>{formatCurrency(criticalVal)}</strong> in asset valuation. Immediate renewal processing is recommended for <em>AlphaCore Systems (EP-3,456,789)</em> and <em>Nexon Biotech Inc. (US-9,876,543)</em> to mitigate statutory forfeiture risk.
        </p>
      </div>

      {/* Two Column Visual Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* Client Valuation Distribution */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px 0' }}>
            🏢 Valuation Breakdown by Client
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {clientDistribution.map(([client, val]) => {
              const pct = Math.round((val / totalVal) * 100);
              return (
                <div key={client}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: C.textPrimary, fontWeight: 600 }}>{client}</span>
                    <span style={{ color: C.textSecondary }}>{formatCurrency(val)} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${C.accent}, #7c3aed)`, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Renewal Urgency Matrix */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px 0' }}>
            ⏳ Renewal Schedule & Value Distribution
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, background: C.criticalBg, border: `1px solid ${C.criticalBorder}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: C.critical, fontSize: 14 }}>🔴 Critical (&lt; 30 Days)</span>
                <span style={{ fontWeight: 700, color: C.critical, fontSize: 14 }}>{formatCurrency(criticalVal)}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>4 Patents require immediate fee payment</div>
            </div>

            <div style={{ padding: 14, background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: C.warning, fontSize: 14 }}>🟡 Warning (30-90 Days)</span>
                <span style={{ fontWeight: 700, color: C.warning, fontSize: 14 }}>{formatCurrency(warningVal)}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>4 Patents scheduled for review</div>
            </div>

            <div style={{ padding: 14, background: C.safeBg, border: `1px solid ${C.safeBorder}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: C.safe, fontSize: 14 }}>🟢 Safe (&gt; 90 Days)</span>
                <span style={{ fontWeight: 700, color: C.safe, fontSize: 14 }}>{formatCurrency(totalVal - criticalVal - warningVal)}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>4 Patents in good standing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ROOT APP
// =============================================================================

type AppPage = 'welcome' | 'login' | 'signup' | 'dashboard';

const App: React.FC<ShellAppProps> = () => {
  const [page, setPage] = useState<AppPage>('welcome');
  const [activeNav, setActiveNav] = useState<NavSection>('welcome');

  const handleNav = (nav: NavSection) => {
    setActiveNav(nav);
    if (nav === 'welcome') setPage('welcome');
    else if (nav === 'login') setPage('login');
    else setPage('dashboard');
  };

  const handleLogout = () => {
    setPage('welcome');
    setActiveNav('welcome');
  };

  return (
    <AppLayout
      sidebar={<SidebarNav active={activeNav} onNav={handleNav} onLogout={handleLogout} />}
      showStatus
    >
      {/* ── Welcome / Intro page ── */}
      {page === 'welcome' && (
        <WelcomePage
          onLogin={() => { setPage('login'); setActiveNav('login'); }}
          onSignup={() => { setPage('signup'); setActiveNav('login'); }}
        />
      )}

      {/* ── Login / Signup page ── */}
      {(page === 'login' || page === 'signup') && (
        <LoginPage
          initialMode={page}
          onLogin={() => { setPage('dashboard'); setActiveNav('dashboard'); }}
          onBack={() => { setPage('welcome'); setActiveNav('welcome'); }}
        />
      )}

      {/* ── Authenticated Dashboard ── */}
      {page === 'dashboard' && (
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          background: C.bg, color: C.textPrimary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
          overflowY: activeNav === 'dashboard' || activeNav === 'clients' || activeNav === 'reports' ? 'auto' : 'hidden',
        }}>
          {activeNav === 'dashboard' && <DashboardView onGoToDocket={() => setActiveNav('docket')} />}
          {activeNav === 'docket'    && <DocketView />}
          {activeNav === 'clients'   && <ClientsView />}
          {activeNav === 'reports'   && <ReportsView />}
        </div>
      )}
    </AppLayout>
  );
};

export default App;
