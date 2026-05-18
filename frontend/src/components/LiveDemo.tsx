// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

/* ── sample data ─────────────────────────────────────────────────────────── */
const DOCS = [
  { name: 'Privacy_Policy_v3.pdf',          icon: '📄', size: '2.4 MB', type: 'PDF'  },
  { name: 'Data_Processing_Agreement.docx', icon: '📝', size: '1.1 MB', type: 'DOCX' },
  { name: 'Security_Controls_Q4.pdf',       icon: '🔒', size: '5.8 MB', type: 'PDF'  },
  { name: 'Payment_Handler_Config.json',    icon: '⚙️', size: '0.3 MB', type: 'JSON' },
]

const FRAMEWORKS = ['GDPR', 'HIPAA', 'SOC 2', 'PCI DSS']

const STAGES = [
  { name: 'Ingestion',    icon: '📥', color: '#3b82f6', ms: 900  },
  { name: 'Extraction',   icon: '🔍', color: '#8b5cf6', ms: 1100 },
  { name: 'Validation',   icon: '✅', color: '#22c55e', ms: 1400 },
  { name: 'Audit Report', icon: '📊', color: '#f59e0b', ms: 800  },
]

const STAGE_LOGS = [
  [
    'Initializing document parser...',
    'Reading file → 847 text segments extracted',
    'Normalizing to compliance schema v2.1',
    'Building document fingerprint',
    '✓ Ingestion complete — 0.31s',
  ],
  [
    'Loading regulatory corpus...',
    'Parsing enforceable articles',
    'Building semantic rule embeddings',
    'Mapping applicable checks',
    '✓ Rule extraction complete',
  ],
  [
    'Starting GPT-4o validation...',
    'Article 5 (Data minimisation): PASS  0.96',
    'Article 17 (Right to erasure): PASS  0.98',
    'Article 32 (Security measures): WARN  0.71',
    'All rules evaluated',
    '✓ Validation complete',
  ],
  [
    'Compiling violations with evidence refs...',
    'Generating remediation recommendations',
    'Signing audit trail (SHA-256)',
    'Exporting PDF report',
    '✓ Report ready for download',
  ],
]

const SCORES = {
  GDPR:    { score: 97, issues: 1, status: 'pass'    },
  HIPAA:   { score: 72, issues: 4, status: 'warning' },
  'SOC 2': { score: 100, issues: 0, status: 'pass'   },
  'PCI DSS': { score: 41, issues: 9, status: 'fail'  },
}

const STATUS_COLOR = { pass: '#22c55e', warning: '#eab308', fail: '#ef4444' }

/* ── helpers ─────────────────────────────────────────────────────────────── */
type RunState = 'idle' | 'running' | 'done'

/* ── component ───────────────────────────────────────────────────────────── */
export default function LiveDemo() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })
  const termBodyRef = useRef<HTMLDivElement>(null)

  const [selectedDoc, setSelectedDoc]     = useState(0)
  const [selectedFw,  setSelectedFw]      = useState('GDPR')
  const [runState,    setRunState]        = useState<RunState>('idle')
  const [activeStage, setActiveStage]     = useState(-1)
  const [doneStages,  setDoneStages]      = useState<number[]>([])
  const [logs,        setLogs]            = useState<string[]>([])
  const [result,      setResult]          = useState<typeof SCORES['GDPR'] | null>(null)

  /* scroll terminal body — NOT the page */
  useEffect(() => {
    const el = termBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs])

  function reset() {
    setRunState('idle')
    setActiveStage(-1)
    setDoneStages([])
    setLogs([])
    setResult(null)
  }

  async function runPipeline() {
    if (runState === 'running') return
    reset()
    await new Promise(r => setTimeout(r, 80))
    setRunState('running')

    for (let si = 0; si < STAGES.length; si++) {
      setActiveStage(si)
      const stageLogs = STAGE_LOGS[si]
      for (const line of stageLogs) {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 180))
        setLogs(prev => [...prev, line])
      }
      await new Promise(r => setTimeout(r, 260))
      setDoneStages(prev => [...prev, si])
    }

    setActiveStage(-1)
    setRunState('done')
    setResult(SCORES[selectedFw] ?? SCORES['GDPR'])
  }

  const scoreVal = result?.score ?? 0
  const scoreColor = result ? STATUS_COLOR[result.status] : '#3b82f6'

  return (
    <section ref={sectionRef} style={styles.section}>
      <div className="container">

        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(32px, 4vw, 56px)' }}
        >
          <p style={styles.eyebrow}>Interactive Demo</p>
          <h2 style={styles.title}>Try the Pipeline Live</h2>
          <p style={styles.subtitle}>
            Select a document and compliance framework, then watch the pipeline execute in real time.
          </p>
        </motion.div>

        {/* demo card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={styles.demoCard}
        >
          <div className="demo-grid" style={styles.demoGrid}>

            {/* ── LEFT: config ── */}
            <div className="demo-config" style={styles.configPanel}>
              <p style={styles.panelLabel}>Select Document</p>
              <div style={styles.docList}>
                {DOCS.map((doc, i) => (
                  <motion.button
                    key={doc.name}
                    onClick={() => { if (runState !== 'running') { setSelectedDoc(i); reset() } }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...styles.docBtn,
                      ...(selectedDoc === i ? styles.docBtnActive : {}),
                      opacity: runState === 'running' ? 0.5 : 1,
                      cursor: runState === 'running' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{doc.icon}</span>
                    <span style={styles.docInfo}>
                      <span style={styles.docName}>{doc.name}</span>
                      <span style={styles.docMeta}>{doc.type} · {doc.size}</span>
                    </span>
                  </motion.button>
                ))}
              </div>

              <p style={{ ...styles.panelLabel, marginTop: 24 }}>Framework</p>
              <div style={styles.fwRow}>
                {FRAMEWORKS.map((fw) => (
                  <motion.button
                    key={fw}
                    onClick={() => { if (runState !== 'running') { setSelectedFw(fw); reset() } }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      ...styles.fwBtn,
                      ...(selectedFw === fw ? styles.fwBtnActive : {}),
                      opacity: runState === 'running' ? 0.5 : 1,
                      cursor: runState === 'running' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {fw}
                  </motion.button>
                ))}
              </div>

              {/* run button */}
              <motion.button
                onClick={runState === 'done' ? reset : runPipeline}
                disabled={runState === 'running'}
                whileHover={runState !== 'running' ? { scale: 1.03, boxShadow: '0 0 32px rgba(59,130,246,0.45)' } : {}}
                whileTap={runState !== 'running' ? { scale: 0.97 } : {}}
                style={{
                  ...styles.runBtn,
                  background: runState === 'running'
                    ? 'rgba(59,130,246,0.4)'
                    : runState === 'done'
                    ? 'rgba(34,197,94,0.15)'
                    : '#3b82f6',
                  borderColor: runState === 'done' ? '#22c55e' : 'transparent',
                  color: runState === 'done' ? '#22c55e' : '#fff',
                  cursor: runState === 'running' ? 'not-allowed' : 'pointer',
                }}
              >
                {runState === 'idle' && '▶  Run Analysis'}
                {runState === 'running' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span style={styles.spinner} />
                    Running…
                  </span>
                )}
                {runState === 'done' && '↺  Run Again'}
              </motion.button>

              {/* result score */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                    style={{ ...styles.resultBox, borderColor: scoreColor + '44', background: scoreColor + '0d' }}
                  >
                    <p style={{ fontSize: 11, color: scoreColor, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>
                      {selectedFw} Score
                    </p>
                    <p style={{ fontSize: 48, fontWeight: 900, color: scoreColor, letterSpacing: '-2px', lineHeight: 1 }}>
                      {scoreVal}<span style={{ fontSize: 22, fontWeight: 600 }}>%</span>
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      {result.issues === 0 ? 'No violations found ✓' : `${result.issues} violation${result.issues !== 1 ? 's' : ''} flagged`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: pipeline + logs ── */}
            <div style={styles.pipelinePanel}>
              {/* stages */}
              <div style={styles.stagesRow}>
                {STAGES.map((stage, i) => {
                  const isDone   = doneStages.includes(i)
                  const isActive = activeStage === i
                  return (
                    <div key={stage.name} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={styles.stageWrap}>
                        <motion.div
                          animate={{
                            background: isDone  ? stage.color + '22'
                                        : isActive ? stage.color + '15'
                                        : 'rgba(255,255,255,0.04)',
                            borderColor: isDone  ? stage.color + '55'
                                          : isActive ? stage.color + '44'
                                          : 'rgba(255,255,255,0.08)',
                            boxShadow: isActive ? `0 0 20px ${stage.color}33` : 'none',
                          }}
                          transition={{ duration: 0.35 }}
                          style={styles.stageIcon}
                        >
                          <AnimatePresence mode="wait">
                            {isDone ? (
                              <motion.span
                                key="done"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ fontSize: 16, color: stage.color }}
                              >✓</motion.span>
                            ) : (
                              <motion.span key="icon" style={{ fontSize: 16 }}>
                                {isActive ? (
                                  <motion.span
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 0.9, repeat: Infinity }}
                                  >{stage.icon}</motion.span>
                                ) : stage.icon}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <span style={{ ...styles.stageLabel, color: isDone ? stage.color : isActive ? '#f0f4ff' : '#475569' }}>
                          {stage.name}
                        </span>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div style={styles.connector}>
                          <motion.div
                            style={{ height: 2, borderRadius: 2, background: STAGES[i].color }}
                            animate={{ width: doneStages.includes(i) ? '100%' : '0%' }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* terminal log */}
              <div style={styles.terminal}>
                <div style={styles.terminalBar}>
                  <span style={{ ...styles.termDot, background: '#ef4444' }} />
                  <span style={{ ...styles.termDot, background: '#eab308' }} />
                  <span style={{ ...styles.termDot, background: '#22c55e' }} />
                  <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>compliance-pipeline — bash</span>
                </div>
                <div ref={termBodyRef} style={styles.terminalBody}>
                  {runState === 'idle' && (
                    <p style={{ color: '#334155', fontSize: 13, fontFamily: 'monospace' }}>
                      $ — waiting for pipeline run…
                    </p>
                  )}
                  <AnimatePresence>
                    {logs.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          ...styles.logLine,
                          color: line.startsWith('✓')
                            ? '#22c55e'
                            : line.includes('WARN')
                            ? '#eab308'
                            : line.includes('FAIL')
                            ? '#ef4444'
                            : '#94a3b8',
                        }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                  {runState === 'running' && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      style={{ display: 'inline-block', width: 8, height: 14, background: '#3b82f6', marginTop: 2, borderRadius: 1 }}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── styles ──────────────────────────────────────────────────────────────── */
const styles = {
  section: {
    padding: 'clamp(48px, 7vw, 100px) 0',
    background: 'var(--bg)',
  },
  eyebrow: {
    fontSize: 11, fontWeight: 600, letterSpacing: '2px',
    textTransform: 'uppercase', color: '#60a5fa', marginBottom: 14,
  },
  title: {
    fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
    letterSpacing: '-0.5px', marginBottom: 16, color: '#f0f4ff',
  },
  subtitle: {
    fontSize: 16, color: '#64748b', maxWidth: 520,
    margin: '0 auto', lineHeight: 1.7,
  },
  demoCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  configPanel: {
    padding: 'clamp(20px, 3vw, 32px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  panelLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
    textTransform: 'uppercase', color: '#475569', marginBottom: 12,
  },
  docList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
  },
  docBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '12px 14px',
    textAlign: 'left', fontFamily: 'inherit',
    transition: 'all 0.2s', width: '100%',
  },
  docBtnActive: {
    background: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.35)',
  },
  docInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  docName: { fontSize: 11, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3, wordBreak: 'break-all' },
  docMeta: { fontSize: 10, color: '#475569' },
  fwRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  fwBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748b', borderRadius: 100,
    padding: '6px 16px', fontSize: 12, fontWeight: 600,
    fontFamily: 'inherit', transition: 'all 0.2s',
  },
  fwBtnActive: {
    background: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.45)',
    color: '#93c5fd',
  },
  runBtn: {
    marginTop: 24, width: '100%', padding: '14px 24px',
    borderRadius: 12, fontWeight: 700, fontSize: 15,
    fontFamily: 'inherit', border: '1px solid transparent',
    transition: 'background 0.3s, box-shadow 0.3s, color 0.3s',
    letterSpacing: '0.02em',
  },
  spinner: {
    display: 'inline-block', width: 14, height: 14,
    borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
  },
  resultBox: {
    marginTop: 20, padding: '20px 24px', borderRadius: 16,
    border: '1px solid', textAlign: 'center',
  },
  pipelinePanel: {
    padding: 'clamp(20px, 3vw, 32px)',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  stagesRow: {
    display: 'flex', alignItems: 'flex-start',
    gap: 0, overflowX: 'auto', paddingBottom: 4,
  },
  stageWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8, minWidth: 72,
  },
  stageIcon: {
    width: 48, height: 48, borderRadius: 14,
    border: '1px solid', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stageLabel: {
    fontSize: 10, fontWeight: 600, textAlign: 'center',
    letterSpacing: '0.5px', maxWidth: 72, lineHeight: 1.3,
    transition: 'color 0.35s',
  },
  connector: {
    flex: 1, height: 2, background: 'rgba(255,255,255,0.06)',
    borderRadius: 2, margin: '0 4px', marginBottom: 28,
    overflow: 'hidden',
  },
  terminal: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, overflow: 'hidden', flex: 1,
  },
  terminalBar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(0,0,0,0.3)',
  },
  termDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  terminalBody: {
    padding: 16, minHeight: 200, maxHeight: 260,
    overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4,
    fontFamily: 'monospace',
  },
  logLine: { fontSize: 12, lineHeight: 1.5 },
}
