// @ts-nocheck
/**
 * BentoGrid — inspired by 21st.dev bento grid pattern
 * Adapted to ComplianceQA design tokens with Framer Motion entrance animations.
 */
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

/* ─── animation variants ─────────────────────────────────────────────────── */
const sectionVariant = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const gridVariant = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const cellVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─── mini components used inside cells ─────────────────────────────────── */

function PulseDot({ color = '#22c55e' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <motion.span
        style={{
          position: 'absolute',
          width: 10, height: 10,
          borderRadius: '50%',
          background: color,
          opacity: 0.4,
        }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
    </span>
  )
}

function MiniBar({ pct, color }) {
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
      <motion.div
        style={{ height: '100%', borderRadius: 4, background: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </div>
  )
}

function SparkLine() {
  const points = [18, 42, 30, 58, 45, 70, 55, 88, 72, 95]
  const w = 200, h = 56
  const max = 100
  const coords = points.map((v, i) => [
    (i / (points.length - 1)) * w,
    h - (v / max) * h,
  ])
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 56 }}>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <motion.path
        d={d}
        fill="none"
        stroke="url(#spark)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      {coords.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x} cy={y} r={3}
          fill="#8b5cf6"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 + i * 0.04, duration: 0.25 }}
        />
      ))}
    </svg>
  )
}

function ActivityFeed() {
  const events = [
    { label: 'GDPR scan complete',      time: '2s ago',  dot: '#22c55e' },
    { label: 'PCI DSS violation flagged', time: '14s ago', dot: '#ef4444' },
    { label: 'SOC 2 report exported',   time: '1m ago',  dot: '#3b82f6' },
    { label: 'HIPAA re-check queued',   time: '3m ago',  dot: '#eab308' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {events.map((e, i) => (
        <motion.div
          key={e.label}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <PulseDot color={e.dot} />
          <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{e.label}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.time}</span>
        </motion.div>
      ))}
    </div>
  )
}

function FrameworkBadges() {
  const badges = [
    { name: 'GDPR',      color: '#3b82f6' },
    { name: 'SOC 2',     color: '#8b5cf6' },
    { name: 'HIPAA',     color: '#22c55e' },
    { name: 'ISO 27001', color: '#f59e0b' },
    { name: 'PCI DSS',   color: '#ef4444' },
    { name: 'NIST CSF',  color: '#06b6d4' },
    { name: 'FedRAMP',   color: '#ec4899' },
    { name: 'CCPA',      color: '#a78bfa' },
  ]
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {badges.map((b, i) => (
        <motion.span
          key={b.name}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          whileHover={{ scale: 1.08 }}
          style={{
            fontSize: 11, fontWeight: 700,
            color: b.color,
            background: `${b.color}18`,
            border: `1px solid ${b.color}33`,
            borderRadius: 100,
            padding: '4px 12px',
            cursor: 'default',
          }}
        >
          {b.name}
        </motion.span>
      ))}
    </div>
  )
}

/* ─── cell hover wrapper ─────────────────────────────────────────────────── */
function BentoCell({ children, style = {}, span = 1, className: extra = '' }) {
  const spanClass = span === 2 ? 'col-span-1 md:col-span-2' : 'col-span-1'
  return (
    <motion.div
      className={`${spanClass}${extra ? ' ' + extra : ''}`}
      variants={cellVariant}
      whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(59,130,246,0.2)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 28,
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

/* ─── main export ────────────────────────────────────────────────────────── */
export default function BentoGrid() {
  const headRef = useRef(null)
  const gridRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })
  const gridInView  = useInView(gridRef,  { once: true, margin: '-60px' })

  const scores = [
    { label: 'Data Privacy',      pct: 96, color: '#3b82f6' },
    { label: 'Access Control',    pct: 88, color: '#8b5cf6' },
    { label: 'Incident Response', pct: 74, color: '#eab308' },
    { label: 'Audit Logging',     pct: 99, color: '#22c55e' },
  ]

  return (
    <section id="features" style={styles.section}>
      <div className="container">

        {/* heading */}
        <motion.div
          ref={headRef}
          variants={sectionVariant}
          initial="hidden"
          animate={headInView ? 'show' : 'hidden'}
          style={styles.heading}
        >
          <p style={styles.eyebrow}>Capabilities</p>
          <h2 style={styles.title}>Everything your compliance team needs</h2>
          <p style={styles.subtitle}>
            One platform to ingest, validate, score, and report across every
            major regulatory framework — with zero manual effort.
          </p>
        </motion.div>

        {/* bento grid */}
        <motion.div
          ref={gridRef}
          variants={gridVariant}
          initial="hidden"
          animate={gridInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 12 }}
        >

          {/* ① Accuracy score — tall left card (row-span on md+) */}
          <BentoCell style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="md:row-span-2">
            <div>
              <p style={styles.cellEyebrow}>Overall Accuracy</p>
              <motion.p
                style={styles.bigNumber}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
              >
                99.8<span style={styles.bigNumberSuffix}>%</span>
              </motion.p>
              <p style={styles.cellBody}>
                Validated across 1.2M+ rule evaluations in the last 30 days with
                zero false-negative critical violations.
              </p>
            </div>
            <div style={{ marginTop: 24 }}>
              {scores.map((s) => (
                <div key={s.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.pct}%</span>
                  </div>
                  <MiniBar pct={s.pct} color={s.color} />
                </div>
              ))}
            </div>
          </BentoCell>

          {/* ② Real-time activity */}
          <BentoCell>
            <p style={styles.cellEyebrow}>Live Activity</p>
            <p style={{ ...styles.cellTitle, marginBottom: 18 }}>Pipeline events in real time</p>
            <ActivityFeed />
          </BentoCell>

          {/* ③ Trend sparkline */}
          <BentoCell>
            <p style={styles.cellEyebrow}>Compliance Trend</p>
            <p style={styles.cellTitle}>Score history — last 10 runs</p>
            <div style={{ marginTop: 16 }}>
              <SparkLine />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Run 1</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Run 10</span>
            </div>
          </BentoCell>

          {/* ④ Frameworks — wide */}
          <BentoCell span={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={styles.cellEyebrow}>Multi-Framework</p>
                <p style={styles.cellTitle}>48 regulatory frameworks supported</p>
              </div>
              <motion.button
                style={styles.ghostBtn}
                whileHover={{ scale: 1.04, borderColor: '#3b82f6', color: '#3b82f6' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                Browse all →
              </motion.button>
            </div>
            <FrameworkBadges />
          </BentoCell>

          {/* ⑤ Sub-2s speed */}
          <BentoCell style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)' }}>
            <div style={styles.speedGlow} />
            <p style={styles.cellEyebrow}>Performance</p>
            <p style={{ ...styles.bigNumber, fontSize: 52 }}>
              2.4<span style={styles.bigNumberSuffix}>s</span>
            </p>
            <p style={styles.cellBody}>Average check time per document, regardless of size or rule complexity.</p>
          </BentoCell>

          {/* ⑥ Audit export */}
          <BentoCell>
            <p style={styles.cellEyebrow}>Audit Export</p>
            <p style={styles.cellTitle}>One-click reports</p>
            <p style={{ ...styles.cellBody, marginTop: 10 }}>
              Export structured audit trails to PDF, JSON, or push directly to your SIEM — fully timestamped and signed.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {['PDF', 'JSON', 'SIEM', 'CSV'].map((fmt, i) => (
                <motion.span
                  key={fmt}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  style={styles.fmtBadge}
                >
                  {fmt}
                </motion.span>
              ))}
            </div>
          </BentoCell>

        </motion.div>
      </div>
    </section>
  )
}

/* ─── styles ─────────────────────────────────────────────────────────────── */
const styles = {
  section: {
    padding: 'clamp(48px, 7vw, 100px) 0',
    background: 'var(--bg)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 56,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#60a5fa',
    marginBottom: 14,
  },
  title: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: 16,
    color: '#f0f4ff',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    maxWidth: 520,
    margin: '0 auto',
    lineHeight: 1.7,
  },
  grid: {},
  cellEyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#60a5fa',
    marginBottom: 8,
  },
  cellTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f4ff',
    letterSpacing: '-0.2px',
  },
  cellBody: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.65,
    marginTop: 8,
  },
  bigNumber: {
    fontSize: 72,
    fontWeight: 800,
    letterSpacing: '-2px',
    lineHeight: 1,
    color: '#f0f4ff',
    marginBottom: 12,
  },
  bigNumberSuffix: {
    fontSize: 36,
    fontWeight: 600,
    color: '#60a5fa',
  },
  ghostBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#64748b',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, color 0.2s',
    flexShrink: 0,
  },
  speedGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  fmtBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '4px 10px',
  },
}
