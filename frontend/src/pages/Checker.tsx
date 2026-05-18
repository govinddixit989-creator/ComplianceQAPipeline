// @ts-nocheck
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/* ── platforms config ────────────────────────────────────────────────────── */
const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',   emoji: '▶',  color: '#ef4444', live: true  },
  { id: 'instagram', label: 'Instagram', emoji: '◈',  color: '#e1306c', live: false },
  { id: 'tiktok',    label: 'TikTok',    emoji: '♪',  color: '#69c9d0', live: false },
  { id: 'twitter',   label: 'Twitter/X', emoji: '𝕏',  color: '#94a3b8', live: false },
]

const STAGES = ['Fetching content', 'Extracting text', 'Analysing compliance', 'Building report']

const SEVERITY_CFG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Critical' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  label: 'High'     },
  medium:   { color: '#eab308', bg: 'rgba(234,179,8,0.1)',   label: 'Medium'   },
  low:      { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Low'      },
}
const STATUS_CFG = {
  pass:    { color: '#22c55e', label: 'COMPLIANT'     },
  warning: { color: '#eab308', label: 'NEEDS REVIEW'  },
  fail:    { color: '#ef4444', label: 'NON-COMPLIANT' },
}

/* ── component ───────────────────────────────────────────────────────────── */
export default function Checker({ onBack }: { onBack: () => void }) {
  const [platform,    setPlatform]  = useState('youtube')
  const [url,         setUrl]       = useState('')
  const [stage,       setStage]     = useState(-1)   // -1=idle, 0-3=running, 4=done
  const [error,       setError]     = useState('')
  const [result,      setResult]    = useState<any>(null)
  const [expanded,    setExpanded]  = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const running = stage >= 0 && stage < 4

  async function runCheck() {
    if (!url.trim()) { inputRef.current?.focus(); return }
    setError(''); setResult(null); setExpanded(null)

    // animate through stages while fetch is in flight
    setStage(0)
    const stageTimer = setInterval(() => {
      setStage(prev => (prev < 3 ? prev + 1 : prev))
    }, 900)

    try {
      const res = await fetch(`${API_BASE}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), platform }),
      })
      clearInterval(stageTimer)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? 'Check failed')
      }
      const data = await res.json()
      setStage(4)
      setResult(data)
    } catch (e: any) {
      clearInterval(stageTimer)
      setStage(-1)
      setError(e.message ?? 'Unknown error')
    }
  }

  function reset() {
    setStage(-1); setResult(null); setError(''); setUrl(''); setExpanded(null)
  }

  const sc = result ? STATUS_CFG[result.status] : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>

      {/* ── sticky top bar ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(2,2,8,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 64, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 52, gap: 16 }}>
          <motion.button whileHover={{ x: -3 }} onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Home
          </motion.button>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>Compliance Checker</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 860 }}>

        {/* ── header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 10 }}>
            Social Media Compliance
          </p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.5px', marginBottom: 10 }}>
            Check Any Post for Violations
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 520 }}>
            Paste a URL and get an instant FTC compliance report — disclosures, false claims,
            platform policy violations, and remediation steps.
          </p>
        </motion.div>

        {/* ── platform selector ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => (
            <motion.button key={p.id} whileHover={p.live ? { scale: 1.04 } : {}} whileTap={p.live ? { scale: 0.97 } : {}}
              onClick={() => p.live && !running && setPlatform(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                borderRadius: 100, border: '1px solid',
                borderColor: platform === p.id ? p.color + '55' : 'rgba(255,255,255,0.08)',
                background: platform === p.id ? p.color + '14' : 'rgba(255,255,255,0.03)',
                color: platform === p.id ? p.color : p.live ? '#64748b' : '#2d3748',
                fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                cursor: p.live && !running ? 'pointer' : 'not-allowed',
                opacity: !p.live ? 0.4 : 1,
              }}>
              <span style={{ fontSize: 14 }}>{p.emoji}</span>
              {p.label}
              {!p.live && <span style={{ fontSize: 10, color: '#334155' }}>soon</span>}
            </motion.button>
          ))}
        </motion.div>

        {/* ── URL input ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <input
            ref={inputRef}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !running && runCheck()}
            disabled={running}
            placeholder="https://www.youtube.com/watch?v=..."
            style={{
              flex: 1, minWidth: 260, padding: '13px 18px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, color: '#f0f4ff', fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <motion.button
            onClick={result ? reset : runCheck}
            disabled={running}
            whileHover={!running ? { scale: 1.03, boxShadow: '0 0 28px rgba(59,130,246,0.4)' } : {}}
            whileTap={!running ? { scale: 0.97 } : {}}
            style={{
              padding: '13px 28px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, fontFamily: 'inherit', border: 'none',
              cursor: running ? 'not-allowed' : 'pointer',
              background: result ? 'rgba(255,255,255,0.06)' : running ? 'rgba(59,130,246,0.4)' : '#3b82f6',
              color: result ? '#64748b' : '#fff',
              minWidth: 140,
            }}>
            {running ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Checking…
              </span>
            ) : result ? '↺ Check Another' : '▶ Check Compliance'}
          </motion.button>
        </motion.div>

        {/* ── error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: 13 }}>
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── pipeline stages (while running) ── */}
        <AnimatePresence>
          {running && (
            <motion.div key="stages" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: 28, padding: '20px 24px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>Running checks…</p>
              {STAGES.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i < stage ? 'rgba(34,197,94,0.15)' : i === stage ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i < stage ? '#22c55e44' : i === stage ? '#3b82f644' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                    {i < stage
                      ? <span style={{ fontSize: 11, color: '#22c55e' }}>✓</span>
                      : i === stage
                      ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'block' }} />
                      : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'block' }} />
                    }
                  </div>
                  <span style={{ fontSize: 13, color: i < stage ? '#22c55e' : i === stage ? '#f0f4ff' : '#334155' }}>{s}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── results ── */}
        <AnimatePresence>
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* video card */}
              <div style={{ display: 'flex', gap: 16, padding: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, flexWrap: 'wrap' }}>
                {result.thumbnail_url && (
                  <img src={result.thumbnail_url} alt="thumbnail"
                    style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff', marginBottom: 4, lineHeight: 1.4 }}>{result.title}</p>
                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>{result.channel_name}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {result.hashtags.slice(0, 6).map((h: string) => (
                      <span key={h} style={{ fontSize: 11, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 100 }}>{h}</span>
                    ))}
                  </div>
                </div>
                {/* score */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: sc.color, letterSpacing: '-2px', lineHeight: 1 }}>
                    {result.score}<span style={{ fontSize: 20, fontWeight: 600 }}>%</span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: sc.color, letterSpacing: '1px', textTransform: 'uppercase', marginTop: 4 }}>{sc.label}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{result.check_time_seconds}s</div>
                </div>
              </div>

              {/* sponsorship detection */}
              <div style={{ padding: '14px 18px', borderRadius: 12, background: result.is_sponsored ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.06)', border: `1px solid ${result.is_sponsored ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)'}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: result.is_sponsored ? '#f59e0b' : '#22c55e' }}>
                  {result.is_sponsored ? '⚡ Sponsored Content Detected' : '✓ No Sponsorship Detected'}
                </span>
                {result.sponsorship_evidence && (
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{result.sponsorship_evidence}</p>
                )}
              </div>

              {/* summary */}
              <div style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Summary</p>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{result.summary}</p>
              </div>

              {/* violations */}
              {result.violations.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                    Violations ({result.violations.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.violations.map((v: any, i: number) => {
                      const sev = SEVERITY_CFG[v.severity] ?? SEVERITY_CFG.medium
                      const open = expanded === i
                      return (
                        <motion.div key={i} layout style={{ borderRadius: 12, border: `1px solid ${sev.color}25`, background: sev.bg, overflow: 'hidden' }}>
                          <button onClick={() => setExpanded(open ? null : i)}
                            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 16px', textAlign: 'left', fontFamily: 'inherit' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: sev.color, background: `${sev.color}20`, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                                {sev.label}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', flex: 1 }}>{v.title}</span>
                              <span style={{ fontSize: 11, color: '#475569' }}>{open ? '▲' : '▼'}</span>
                            </div>
                          </button>
                          <AnimatePresence>
                            {open && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{v.description}</p>
                                  {v.evidence && (
                                    <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, borderLeft: `3px solid ${sev.color}` }}>
                                      <p style={{ fontSize: 11, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Evidence</p>
                                      <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{v.evidence}</p>
                                    </div>
                                  )}
                                  <div style={{ padding: '10px 12px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
                                    <p style={{ fontSize: 11, color: '#60a5fa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Fix</p>
                                    <p style={{ fontSize: 13, color: '#93c5fd' }}>{v.recommendation}</p>
                                  </div>
                                  <p style={{ fontSize: 11, color: '#334155' }}>Rule: {v.rule_id}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* compliant items */}
              {result.compliant_items.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                    Compliant ({result.compliant_items.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.compliant_items.map((c: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#86efac', marginBottom: 2 }}>{c.title}</p>
                          {c.evidence && <p style={{ fontSize: 12, color: '#475569' }}>{c.evidence}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── empty state hint ── */}
        {!running && !result && !error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontSize: 12, color: '#1e293b', textAlign: 'center', marginTop: 40 }}>
            Works best on sponsored/review videos — try a YouTube video that promotes a product or brand
          </motion.p>
        )}

      </div>
    </div>
  )
}
