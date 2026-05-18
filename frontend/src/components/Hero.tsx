import { useRef, useState, useCallback } from 'react'
import { motion, type Variants } from 'framer-motion'
import type { Application } from '@splinetool/runtime'
import { SplineScene } from '@/components/ui/splite'
import SocialProtectionOverlay from './SocialProtectionOverlay'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const stats = [
  { value: '99.8%',  label: 'Accuracy' },
  { value: '2.4s',   label: 'Avg. Check Time' },
  { value: '1,200+', label: 'Rules Enforced' },
  { value: '48',     label: 'Frameworks' },
]

export default function Hero() {
  const [splineLoaded, setSplineLoaded] = useState(false)
  const splineAppRef = useRef<Application | null>(null)
  const sceneContainerRef = useRef<HTMLDivElement>(null)

  const handleSplineLoad = useCallback((app: Application) => {
    splineAppRef.current = app
    setSplineLoaded(true)
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-[#000005]" style={{ minHeight: '100svh' }}>

      {/* glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/[0.09] blur-[130px]" />
        <div className="absolute top-1/2 right-0 w-[450px] h-[450px] rounded-full bg-violet-700/[0.07] blur-[110px]" />
      </div>

      {/* dot grid — fades toward right on desktop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 75% 90% at 35% 45%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 90% at 35% 45%, black 20%, transparent 100%)',
        }}
      />

      {/* ── flex container: stack on mobile, side-by-side on lg ── */}
      <div
        className="relative z-10 flex flex-col lg:flex-row"
        style={{ minHeight: '100svh', paddingTop: 56 }}
      >

        {/* ══ LEFT — text ══ */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center w-full lg:w-[52%]"
          style={{ padding: 'clamp(56px, 8vw, 120px) clamp(20px, 4vw, 56px) clamp(56px, 8vw, 120px) clamp(24px, 8vw, 120px)' }}
        >
          {/* badge */}
          <motion.div variants={fadeUp} className="mb-6 w-fit">
            <span className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full border border-blue-500/25 bg-blue-500/[0.08] text-blue-300 text-[11px] font-semibold tracking-[0.1em] uppercase">
              <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 flex-shrink-0"
                style={{ boxShadow: '0 0 0 2px rgba(52,211,153,0.25), 0 0 10px rgba(52,211,153,0.5)' }} />
              AI-Powered Compliance Platform
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            variants={fadeUp}
            className="font-black tracking-tight leading-[1.02] mb-5"
            style={{ fontSize: 'clamp(40px, 5vw, 76px)', letterSpacing: '-0.03em' }}
          >
            <span className="block text-white/95">Intelligent</span>
            <span className="block text-white/95">Compliance,</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(95deg,#3b82f6 0%,#06b6d4 45%,#818cf8 100%)' }}
            >
              Automated.
            </span>
          </motion.h1>

          {/* subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-slate-400 leading-relaxed mb-8 max-w-[440px]"
            style={{ fontSize: 'clamp(14px, 1.1vw, 16px)' }}
          >
            Validate regulatory adherence across your entire document corpus.
            Powered by intelligent agents — built for enterprise scale.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
            <motion.button
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm cursor-pointer border-0"
              style={{ fontFamily: 'inherit', letterSpacing: '0.01em' }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(59,130,246,0.5)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              Start Pipeline →
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer bg-transparent text-slate-400"
              style={{ fontFamily: 'inherit', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.01em', transition: 'all 0.2s' }}
              whileHover={{ borderColor: 'rgba(99,152,255,0.4)', color: '#93c5fd' }}
              whileTap={{ scale: 0.97 }}
            >
              View Docs
            </motion.button>
          </motion.div>

          {/* stats — 2 cols on mobile, 4 on md+ */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-x-0 gap-y-5 pt-7"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col gap-1"
                style={{
                  paddingRight: 20,
                  borderRight: (i === 1 || i === 3) ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  paddingLeft: i % 2 !== 0 ? 20 : 0,
                }}
              >
                <span className="font-extrabold text-slate-100 tracking-tight" style={{ fontSize: 'clamp(18px, 1.5vw, 24px)' }}>
                  {s.value}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.08em]">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══ RIGHT — Spline: hidden on small mobile, full on lg ══ */}
        <motion.div
          ref={sceneContainerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="w-full lg:w-[48%] relative"
          style={{ minHeight: 360 }}
        >
          {/* left-edge fade into bg */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 hidden lg:block"
            style={{ background: 'linear-gradient(to right, #000005, transparent)' }}
          />
          {/* bottom fade */}
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 h-20 z-10"
            style={{ background: 'linear-gradient(to top, #000005, transparent)' }}
          />
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            onLoad={handleSplineLoad}
          />
          {/* social logos — track the robot hands */}
          <SocialProtectionOverlay
            splineApp={splineAppRef.current}
            splineLoaded={splineLoaded}
            containerRef={sceneContainerRef}
          />
        </motion.div>
      </div>
    </section>
  )
}
