// @ts-nocheck
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const metrics = [
  { label: 'Documents Processed', rawValue: 14832, display: (n) => n.toLocaleString(), suffix: '', change: '+12%', up: true },
  { label: 'Rules Evaluated',     rawValue: 1200,  display: (n) => (n / 1000).toFixed(1) + 'M', suffix: '', change: '+8%', up: true },
  { label: 'Violations Detected', rawValue: 247,   display: (n) => n.toLocaleString(), suffix: '', change: '-31%', up: false },
  { label: 'Avg. Confidence',     rawValue: 943,   display: (n) => (n / 10).toFixed(1) + '%', suffix: '', change: '+2.1%', up: true },
]

function useCounter(target: number, isInView: boolean, duration = 1400) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!isInView || started.current) return
    started.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target, duration])

  return value
}

function MetricCard({ metric, delay }: { metric: typeof metrics[0]; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const count = useCounter(metric.rawValue, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, borderColor: 'rgba(59,130,246,0.25)' }}
      style={styles.card}
    >
      <p style={styles.label}>{metric.label}</p>
      <p style={styles.value}>{metric.display(count)}</p>
      <span style={{ ...styles.change, color: metric.up ? '#22c55e' : '#ef4444' }}>
        {metric.up ? '↑' : '↓'} {metric.change} vs last run
      </span>
    </motion.div>
  )
}

export default function MetricsBar() {
  return (
    <section id="metrics" style={styles.section}>
      <div className="container">
        <div style={styles.grid}>
          {metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

const styles = {
  section: {
    padding: 'clamp(40px, 6vw, 80px) 0',
    background: 'var(--bg)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 1,
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.07)',
  },
  card: {
    background: '#020208',
    padding: 'clamp(20px, 3vw, 32px) clamp(16px, 2.5vw, 28px)',
    transition: 'background 0.3s, border-color 0.3s',
    border: '1px solid transparent',
    cursor: 'default',
  },
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  value: {
    fontSize: 'clamp(24px, 3vw, 34px)',
    fontWeight: 800,
    color: '#f0f4ff',
    letterSpacing: '-0.5px',
    marginBottom: 6,
    fontVariantNumeric: 'tabular-nums',
  },
  change: {
    fontSize: 12,
    fontWeight: 600,
  },
}
