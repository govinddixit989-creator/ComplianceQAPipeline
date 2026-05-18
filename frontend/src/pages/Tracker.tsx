// @ts-nocheck
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── platform data ──────────────────────────────────────────────────────── */
const PLATFORMS = [
  { name: 'YouTube',   emoji: '▶',  color: '#ef4444', status: 'connected' },
  { name: 'Instagram', emoji: '◈',  color: '#e1306c', status: 'pending'   },
  { name: 'Twitter/X', emoji: '𝕏',  color: '#94a3b8', status: 'pending'   },
  { name: 'TikTok',    emoji: '♪',  color: '#69c9d0', status: 'review'    },
  { name: 'LinkedIn',  emoji: 'in', color: '#0a66c2', status: 'pending'   },
  { name: 'Facebook',  emoji: 'f',  color: '#1877f2', status: 'pending'   },
]

const PLATFORM_STATUS_LABEL = {
  connected: { label: 'Connected',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  pending:   { label: 'Pending',    color: '#64748b', bg: 'rgba(255,255,255,0.05)' },
  review:    { label: 'In Review',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
}

/* ─── roadmap phases & tasks ────────────────────────────────────────────── */
const INITIAL_PHASES = [
  {
    id: 1, name: 'Compliance Rule Design', icon: '📋', color: '#3b82f6',
    tasks: [
      { id: 1,  name: 'Document FTC disclosure requirements',     status: 'done'        },
      { id: 2,  name: 'Map GDPR social media obligations',        status: 'done'        },
      { id: 3,  name: 'Build brand guideline rule set',           status: 'in-progress' },
      { id: 4,  name: 'Configure AI Search index schema',         status: 'todo'        },
    ],
  },
  {
    id: 2, name: 'Platform API Connectors', icon: '🔌', color: '#8b5cf6',
    tasks: [
      { id: 5,  name: 'YouTube Data API v3 integration',          status: 'in-progress' },
      { id: 6,  name: 'Meta Graph API (Instagram + Facebook)',     status: 'todo'        },
      { id: 7,  name: 'Twitter/X API v2 connector',               status: 'todo'        },
      { id: 8,  name: 'TikTok Research API application',          status: 'todo'        },
      { id: 9,  name: 'LinkedIn Marketing API connector',         status: 'todo'        },
    ],
  },
  {
    id: 3, name: 'Content Extraction', icon: '🔍', color: '#22c55e',
    tasks: [
      { id: 10, name: 'Caption & text NLP extractor',             status: 'todo'        },
      { id: 11, name: 'GPT-4o Vision for image analysis',         status: 'todo'        },
      { id: 12, name: 'Azure Video Indexer transcription',        status: 'todo'        },
      { id: 13, name: 'Hashtag & mention parser',                 status: 'todo'        },
    ],
  },
  {
    id: 4, name: 'Compliance Engine', icon: '⚙️', color: '#f59e0b',
    tasks: [
      { id: 14, name: 'Rule matching pipeline',                   status: 'todo'        },
      { id: 15, name: 'Violation scoring system',                 status: 'todo'        },
      { id: 16, name: 'Severity level classification',            status: 'todo'        },
      { id: 17, name: 'Remediation suggestion generator',         status: 'todo'        },
    ],
  },
  {
    id: 5, name: 'Monitoring & Alerts', icon: '🔔', color: '#ef4444',
    tasks: [
      { id: 18, name: 'Scheduled API polling (cron jobs)',        status: 'todo'        },
      { id: 19, name: 'Webhook real-time event handling',         status: 'todo'        },
      { id: 20, name: 'Email + Slack alert integration',          status: 'todo'        },
      { id: 21, name: 'Audit trail → Azure Blob Storage',         status: 'todo'        },
    ],
  },
  {
    id: 6, name: 'Dashboard & Reporting', icon: '📊', color: '#06b6d4',
    tasks: [
      { id: 22, name: 'Per-platform compliance dashboard',        status: 'todo'        },
      { id: 23, name: 'Violation drill-down reports',             status: 'todo'        },
      { id: 24, name: 'Export to PDF / CSV / SIEM',               status: 'todo'        },
    ],
  },
]

const NEXT_STATUS = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' }
const STATUS_CFG = {
  todo:          { label: 'To Do',       color: '#475569', bg: 'rgba(71,85,105,0.15)'  },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  done:          { label: 'Done',        color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
}

/* mock check outcomes per task — cycles through on each run */
const CHECK_POOL = [
  { score: 98, status: 'pass',    note: 'All compliance gates cleared'          },
  { score: 91, status: 'pass',    note: 'Rule set validated successfully'        },
  { score: 74, status: 'warning', note: 'Missing FTC disclosure mapping'         },
  { score: 88, status: 'pass',    note: 'API integration meets security baseline'},
  { score: 62, status: 'warning', note: 'Rate-limit strategy undefined'          },
  { score: 95, status: 'pass',    note: 'Integration tests passed'               },
  { score: 45, status: 'fail',    note: 'Critical: GDPR consent flow incomplete' },
]
const CHECK_COLOR = { pass: '#22c55e', warning: '#f59e0b', fail: '#ef4444' }

/* ─── mini inline check animation ───────────────────────────────────────── */
function CheckRunner({ taskId, onDone }: { taskId: number; onDone: (r: any) => void }) {
  const [step, setStep] = useState(0) // 0-3 = stages, 4 = done
  const steps = ['Parsing task context…', 'Matching compliance rules…', 'Scoring output…', 'Generating report…']

  useState(() => {
    let s = 0
    const iv = setInterval(() => {
      s++
      setStep(s)
      if (s >= steps.length) {
        clearInterval(iv)
        const result = CHECK_POOL[taskId % CHECK_POOL.length]
        setTimeout(() => onDone(result), 300)
      }
    }, 500)
    return () => clearInterval(iv)
  })

  return (
    <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.15)' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: i < step ? '#22c55e' : i === step ? '#60a5fa' : '#334155' }}>
            {i < step ? '✓' : i === step ? '›' : '·'}
          </span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: i < step ? '#22c55e' : i === step ? '#94a3b8' : '#334155' }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── single task row ────────────────────────────────────────────────────── */
function TaskRow({ task, phaseColor, onStatusChange }) {
  const [checking, setChecking]   = useState(false)
  const [checkResult, setResult]  = useState(task.checkResult ?? null)
  const cfg = STATUS_CFG[task.status]

  function handleCheck() {
    setResult(null)
    setChecking(true)
  }

  function handleCheckDone(result) {
    setChecking(false)
    setResult(result)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.taskRow}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* status toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { onStatusChange(); setResult(null); setChecking(false) }}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
            border: task.status === 'done' ? 'none' : `2px solid ${phaseColor}55`,
            background: task.status === 'done' ? phaseColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {task.status === 'done' && <span style={{ fontSize: 11, color: '#fff' }}>✓</span>}
          {task.status === 'in-progress' && (
            <motion.span
              style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor, display: 'block' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* task name */}
        <span style={{
          flex: 1, fontSize: 13, fontWeight: 500,
          color: task.status === 'done' ? '#475569' : '#e2e8f0',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          textDecorationColor: '#334155',
        }}>
          {task.name}
        </span>

        {/* status badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
          textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100,
          color: cfg.color, background: cfg.bg, flexShrink: 0,
        }}>
          {cfg.label}
        </span>

        {/* verify button — only when done */}
        {task.status === 'done' && !checking && !checkResult && (
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 14px rgba(59,130,246,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCheck}
            style={styles.verifyBtn}
          >
            ▶ Verify
          </motion.button>
        )}
      </div>

      {/* inline check runner */}
      {checking && <CheckRunner taskId={task.id} onDone={handleCheckDone} />}

      {/* check result */}
      <AnimatePresence>
        {checkResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 10,
              border: `1px solid ${CHECK_COLOR[checkResult.status]}33`,
              background: `${CHECK_COLOR[checkResult.status]}0d`,
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: CHECK_COLOR[checkResult.status], letterSpacing: '-1px' }}>
                {checkResult.score}%
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: CHECK_COLOR[checkResult.status], textTransform: 'uppercase', letterSpacing: '1px' }}>
                {checkResult.status}
              </span>
              <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{checkResult.note}</span>
              <motion.button
                whileHover={{ color: '#93c5fd' }}
                onClick={handleCheck}
                style={{ fontSize: 11, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                re-check
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── phase accordion card ───────────────────────────────────────────────── */
function PhaseCard({ phase, onTaskStatusChange }) {
  const [open, setOpen] = useState(phase.id <= 2)
  const total   = phase.tasks.length
  const done    = phase.tasks.filter(t => t.status === 'done').length
  const inProg  = phase.tasks.filter(t => t.status === 'in-progress').length
  const pct     = Math.round((done / total) * 100)

  return (
    <motion.div layout style={styles.phaseCard}>
      {/* header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
          <span style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: `${phase.color}18`, border: `1px solid ${phase.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {phase.icon}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff' }}>{phase.name}</span>
              {done === total && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 100 }}>
                  COMPLETE
                </span>
              )}
              {inProg > 0 && done < total && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '2px 8px', borderRadius: 100 }}>
                  IN PROGRESS
                </span>
              )}
            </div>
            {/* progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: phase.color }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
              {done}/{total}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 12, color: '#475569', display: 'block' }}
            >▼</motion.span>
          </div>
        </div>
      </button>

      {/* tasks */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="tasks"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {phase.tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  phaseColor={phase.color}
                  onStatusChange={() => onTaskStatusChange(phase.id, task.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── main tracker page ──────────────────────────────────────────────────── */
export default function Tracker({ onBack }: { onBack: () => void }) {
  const [phases, setPhases] = useState(INITIAL_PHASES)
  const [platforms, setPlatforms] = useState(PLATFORMS)

  const allTasks  = phases.flatMap(p => p.tasks)
  const doneTasks = allTasks.filter(t => t.status === 'done').length
  const inProgTasks = allTasks.filter(t => t.status === 'in-progress').length
  const phasesComplete = phases.filter(p => p.tasks.every(t => t.status === 'done')).length
  const overallPct = Math.round((doneTasks / allTasks.length) * 100)

  function cycleTaskStatus(phaseId, taskId) {
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : {
        ...p,
        tasks: p.tasks.map(t =>
          t.id !== taskId ? t : { ...t, status: NEXT_STATUS[t.status] }
        ),
      }
    ))
  }

  function togglePlatform(name) {
    setPlatforms(prev => prev.map(p =>
      p.name !== name ? p : {
        ...p,
        status: p.status === 'connected' ? 'pending' : 'connected',
      }
    ))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>

      {/* ── top bar ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(2,2,8,0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 64, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <motion.button
              whileHover={{ x: -3 }}
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ← Home
            </motion.button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>Social Media Compliance Tracker</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Tasks Done',   value: `${doneTasks}/${allTasks.length}`, color: '#22c55e'  },
              { label: 'In Progress',  value: inProgTasks,                        color: '#f59e0b'  },
              { label: 'Phases Done',  value: `${phasesComplete}/6`,             color: '#3b82f6'  },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* ── overall progress ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32, padding: '20px 24px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Overall Roadmap Progress</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.5px' }}>{overallPct}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 8, background: 'linear-gradient(90deg,#3b82f6,#06b6d4,#8b5cf6)' }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {phases.map(p => {
              const pDone = p.tasks.every(t => t.status === 'done')
              const pProg = p.tasks.some(t => t.status === 'in-progress')
              return (
                <div key={p.id} title={p.name} style={{ flex: 1, height: 4, borderRadius: 4, background: pDone ? p.color : pProg ? `${p.color}55` : 'rgba(255,255,255,0.06)' }} />
              )
            })}
          </div>
        </motion.div>

        {/* ── platform status ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 32 }}
        >
          <p style={styles.sectionLabel}>Platform Connections</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {platforms.map(p => {
              const cfg = PLATFORM_STATUS_LABEL[p.status]
              return (
                <motion.button
                  key={p.name}
                  whileHover={{ y: -3, boxShadow: `0 8px 24px ${p.color}22` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => togglePlatform(p.name)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${p.status === 'connected' ? p.color + '44' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 14, padding: '14px 12px',
                    cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: p.status === 'connected' ? p.color : '#334155', marginBottom: 6 }}>
                    {p.emoji}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: p.status === 'connected' ? '#f0f4ff' : '#475569', marginBottom: 6 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 100, display: 'inline-block' }}>
                    {cfg.label}
                  </div>
                </motion.button>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: '#334155', marginTop: 8 }}>Click a platform to toggle connection status</p>
        </motion.div>

        {/* ── phase accordion ── */}
        <p style={styles.sectionLabel}>Roadmap Phases & Tasks</p>
        <p style={{ fontSize: 11, color: '#334155', marginBottom: 16 }}>
          Click the circle to cycle status: To Do → In Progress → Done &nbsp;·&nbsp; Click "Verify" on completed tasks to run a compliance check
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <PhaseCard
                phase={phase}
                onTaskStatusChange={cycleTaskStatus}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}

/* ─── styles ─────────────────────────────────────────────────────────────── */
const styles = {
  sectionLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
    textTransform: 'uppercase', color: '#475569', marginBottom: 12,
  },
  phaseCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, overflow: 'hidden',
  },
  taskRow: {
    padding: '10px 12px', borderRadius: 10,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  verifyBtn: {
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#93c5fd', borderRadius: 8,
    padding: '4px 12px', fontSize: 11, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
    letterSpacing: '0.5px',
  },
}
