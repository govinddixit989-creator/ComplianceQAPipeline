// @ts-nocheck
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Stage {
  step: string
  title: string
  desc: string
  icon: string
  color: string
}

const stages = [
  {
    step: '01',
    title: 'Document Ingestion',
    desc: 'Ingest documents from any source — PDFs, APIs, databases — and normalize them into a unified schema for analysis.',
    icon: '📥',
    color: '#3b82f6',
  },
  {
    step: '02',
    title: 'Rule Extraction',
    desc: 'Parse regulatory frameworks and extract enforceable rules using NLP models trained on compliance corpora.',
    icon: '🔍',
    color: '#8b5cf6',
  },
  {
    step: '03',
    title: 'QA Validation',
    desc: 'Run each document against extracted rules with confidence scoring, flagging violations and edge cases.',
    icon: '✅',
    color: '#22c55e',
  },
  {
    step: '04',
    title: 'Audit Reporting',
    desc: 'Generate structured audit trails with remediation recommendations, exportable to PDF or your SIEM platform.',
    icon: '📊',
    color: '#f59e0b',
  },
]

function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{
        y: -6,
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${stage.color}33`,
      }}
      style={{ ...styles.card, borderColor: 'var(--border)' }}
    >
      <div style={styles.cardHeader}>
        <span style={{ ...styles.stepBadge, color: stage.color, borderColor: `${stage.color}33`, background: `${stage.color}11` }}>
          {stage.step}
        </span>
        <span style={styles.icon}>{stage.icon}</span>
      </div>
      <h3 style={styles.cardTitle}>{stage.title}</h3>
      <p style={styles.cardDesc}>{stage.desc}</p>
      <motion.div
        style={{ ...styles.progressBar, background: stage.color }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
      />
    </motion.div>
  )
}

export default function PipelineStages() {
  const headingRef = useRef(null)
  const isInView = useInView(headingRef, { once: true, margin: '-60px' })

  return (
    <section id="pipeline" style={styles.section}>
      <div className="container">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={styles.heading}
        >
          <p style={styles.eyebrow}>How It Works</p>
          <h2 style={styles.title}>Four-Stage Pipeline</h2>
          <p style={styles.subtitle}>
            A fully automated end-to-end compliance workflow from raw documents to audit-ready reports.
          </p>
        </motion.div>

        <div style={styles.grid}>
          {stages.map((stage, i) => (
            <StageCard key={stage.step} stage={stage} index={i} />
          ))}
        </div>
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
    maxWidth: 520,
    margin: '0 auto',
    lineHeight: 1.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
  },
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 28,
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.3s, background 0.3s',
    backdropFilter: 'blur(8px)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '4px 10px',
    borderRadius: 100,
    border: '1px solid',
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#f0f4ff',
    marginBottom: 10,
    letterSpacing: '-0.2px',
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.65,
    marginBottom: 24,
  },
  progressBar: {
    height: 2,
    borderRadius: 2,
    transformOrigin: 'left',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}
