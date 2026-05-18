// @ts-nocheck
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Check {
  name: string
  status: 'pass' | 'warning' | 'fail'
  score: number
  framework: string
  category: string
}

const checks = [
  { name: 'GDPR Article 17', status: 'pass', score: 98, framework: 'GDPR', category: 'Data Rights' },
  { name: 'SOC 2 CC6.1', status: 'pass', score: 95, framework: 'SOC 2', category: 'Logical Access' },
  { name: 'HIPAA § 164.312', status: 'warning', score: 72, framework: 'HIPAA', category: 'Technical Safeguards' },
  { name: 'ISO 27001 A.9', status: 'pass', score: 91, framework: 'ISO 27001', category: 'Access Control' },
  { name: 'PCI DSS Req. 8', status: 'fail', score: 41, framework: 'PCI DSS', category: 'Identity Mgmt' },
  { name: 'NIST CSF PR.AC', status: 'pass', score: 88, framework: 'NIST CSF', category: 'Access Control' },
  { name: 'CCPA § 1798.100', status: 'warning', score: 67, framework: 'CCPA', category: 'Consumer Rights' },
  { name: 'FedRAMP AC-2', status: 'pass', score: 94, framework: 'FedRAMP', category: 'Account Mgmt' },
  { name: 'DORA Article 6', status: 'pass', score: 89, framework: 'DORA', category: 'ICT Risk Mgmt' },
]

const statusConfig = {
  pass: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'PASS' },
  warning: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', label: 'WARN' },
  fail: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'FAIL' },
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

function CheckCard({ check }: { check: Check }) {
  const cfg = statusConfig[check.status]

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.3)' }}
      style={styles.card}
    >
      <div style={styles.cardTop}>
        <div>
          <p style={styles.framework}>{check.framework}</p>
          <p style={styles.name}>{check.name}</p>
        </div>
        <span style={{ ...styles.statusBadge, color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
      </div>

      <p style={styles.category}>{check.category}</p>

      <div style={styles.scoreRow}>
        <span style={styles.scoreLabel}>Compliance Score</span>
        <span style={{ ...styles.scoreValue, color: cfg.color }}>{check.score}%</span>
      </div>

      <div style={styles.barTrack}>
        <motion.div
          style={{ ...styles.barFill, background: cfg.color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${check.score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

export default function ComplianceCards() {
  const headingRef = useRef(null)
  const isInView = useInView(headingRef, { once: true, margin: '-60px' })
  const gridRef = useRef(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' })

  return (
    <section id="checks" style={styles.section}>
      <div className="container">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={styles.heading}
        >
          <p style={styles.eyebrow}>Live Results</p>
          <h2 style={styles.title}>Compliance Checks</h2>
          <p style={styles.subtitle}>
            Real-time validation across multiple regulatory frameworks with detailed scoring.
          </p>
        </motion.div>

        <motion.div
          ref={gridRef}
          variants={container}
          initial="hidden"
          animate={gridInView ? 'show' : 'hidden'}
          style={styles.grid}
        >
          {checks.map((check) => (
            <CheckCard key={check.name} check={check} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const styles = {
  section: {
    padding: 'clamp(48px, 7vw, 100px) 0',
    background: 'var(--bg)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 60,
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
    maxWidth: 500,
    margin: '0 auto',
    lineHeight: 1.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 12,
  },
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 22,
    cursor: 'default',
    backdropFilter: 'blur(8px)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  framework: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#60a5fa',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f0f4ff',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '4px 8px',
    borderRadius: 6,
    flexShrink: 0,
  },
  category: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  barTrack: {
    height: 3,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
}
