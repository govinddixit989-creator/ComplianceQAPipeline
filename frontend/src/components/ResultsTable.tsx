// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const allResults = [
  { id: 'RUN-001', doc: 'Privacy_Policy_v3.pdf', framework: 'GDPR', rules: 42, passed: 41, status: 'pass', time: '1.8s' },
  { id: 'RUN-002', doc: 'Data_Processing_Agreement.docx', framework: 'HIPAA', rules: 38, passed: 27, status: 'warning', time: '2.1s' },
  { id: 'RUN-003', doc: 'Security_Controls_Q4.pdf', framework: 'SOC 2', rules: 95, passed: 95, status: 'pass', time: '3.4s' },
  { id: 'RUN-004', doc: 'Payment_Handler_Config.json', framework: 'PCI DSS', rules: 61, passed: 25, status: 'fail', time: '1.2s' },
  { id: 'RUN-005', doc: 'Access_Policy_2024.pdf', framework: 'ISO 27001', rules: 55, passed: 51, status: 'pass', time: '2.7s' },
  { id: 'RUN-006', doc: 'Vendor_Contract_Acme.pdf', framework: 'CCPA', rules: 29, passed: 19, status: 'warning', time: '1.5s' },
  { id: 'RUN-007', doc: 'IR_Playbook_v2.pdf', framework: 'NIST CSF', rules: 78, passed: 75, status: 'pass', time: '3.1s' },
]

const statusConfig = {
  pass: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Pass' },
  warning: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', label: 'Warning' },
  fail: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Fail' },
}

const FILTERS = ['All', 'Pass', 'Warning', 'Fail']

export default function ResultsTable() {
  const headingRef = useRef(null)
  const tableRef = useRef(null)
  const isInView = useInView(headingRef, { once: true, margin: '-60px' })
  const tableInView = useInView(tableRef, { once: true, margin: '-60px' })
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? allResults
    : allResults.filter((r) => r.status === filter.toLowerCase())

  return (
    <section id="results" style={styles.section}>
      <div className="container">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={styles.headingRow}
        >
          <div>
            <p style={styles.eyebrow}>Audit Trail</p>
            <h2 style={styles.title}>Run Results</h2>
          </div>

          <div style={styles.filters}>
            {FILTERS.map((f) => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? styles.filterBtnActive : {}),
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          ref={tableRef}
          initial={{ opacity: 0, y: 20 }}
          animate={tableInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={styles.tableWrapper}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                {['Run ID', 'Document', 'Framework', 'Rules', 'Passed', 'Status', 'Time'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((row, i) => {
                  const cfg = statusConfig[row.status]
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      whileHover={{ backgroundColor: 'var(--bg-card-hover)' }}
                      style={styles.tr}
                    >
                      <td style={{ ...styles.td, color: '#3b82f6', fontWeight: 600, fontFamily: 'monospace' }}>{row.id}</td>
                      <td style={{ ...styles.td, maxWidth: 220 }}>
                        <span style={styles.docName}>{row.doc}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.frameworkBadge}>{row.framework}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{row.rules}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{row.passed}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusPill, color: cfg.color, background: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{row.time}</td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
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
  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#60a5fa',
    marginBottom: 8,
  },
  title: {
    fontSize: 'clamp(24px, 3vw, 36px)',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#f0f4ff',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748b',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: 'rgba(59,130,246,0.12)',
    borderColor: 'rgba(59,130,246,0.4)',
    color: '#93c5fd',
  },
  tableWrapper: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    overflow: 'hidden',
    overflowX: 'auto',
    backdropFilter: 'blur(8px)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 20px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#475569',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(0,0,0,0.3)',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.15s',
    cursor: 'default',
  },
  td: {
    padding: '14px 20px',
    fontSize: 13,
    color: '#64748b',
    verticalAlign: 'middle',
  },
  docName: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 220,
  },
  frameworkBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#a78bfa',
    background: 'rgba(139,92,246,0.12)',
    padding: '3px 8px',
    borderRadius: 6,
  },
  statusPill: {
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 100,
  },
}
