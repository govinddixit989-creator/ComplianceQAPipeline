// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Application } from '@splinetool/runtime'

const PLATFORMS = [
  {
    name: 'YouTube',
    color: '#ff0000',
    glow: 'rgba(255,0,0,0.4)',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    color: '#e1306c',
    glow: 'rgba(225,48,108,0.4)',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.2 4.8 1.7 5 5 .1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.2 3.3-1.7 4.8-5 5-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.2-4.8-1.7-5-5C2 16.6 2 16.3 2 13s0-3.6.1-4.9c.2-3.3 1.7-4.8 5-5C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-2.5.1-3.5 1.1-3.6 3.6C3.6 8.9 3.6 9.2 3.6 12s0 3.1.1 4.3c.1 2.5 1.1 3.5 3.6 3.6 1.2.1 1.5.1 4.7.1s3.5 0 4.7-.1c2.5-.1 3.5-1.1 3.6-3.6.1-1.2.1-1.5.1-4.3s0-3.1-.1-4.3c-.1-2.5-1.1-3.5-3.6-3.6C15.5 4 15.1 4 12 4zm0 3a5 5 0 1 1 0 10A5 5 0 0 1 12 7zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM17.2 6a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 17.2 6z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    color: '#69c9d0',
    glow: 'rgba(105,201,208,0.4)',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19.6 3.3A4.9 4.9 0 0 1 14.8 0h-3.2v16.4a2.9 2.9 0 0 1-2.9 2.7 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .5 0 .7.1V10a6.1 6.1 0 0 0-.7 0A6.1 6.1 0 0 0 2.6 16a6.1 6.1 0 0 0 6.1 6.1A6.1 6.1 0 0 0 14.8 16V8.1a8 8 0 0 0 4.8 1.6V6.5a4.9 4.9 0 0 1-3-3.2h3z" />
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    color: '#e2e8f0',
    glow: 'rgba(226,232,240,0.3)',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18.3 1.5h3.5l-7.7 8.8 9 11.9h-7l-5.5-7.2-6.3 7.2H1l8.2-9.4L.7 1.5h7.2l5 6.6 5.4-6.6zm-1.2 18.5h1.9L7 3.4H5L17.1 20z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    color: '#0a66c2',
    glow: 'rgba(10,102,194,0.45)',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.8-3-1.9 0-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.2 2.4 4.2 5.4v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM3.5 20.4h3.6V9H3.5v11.4z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    color: '#1877f2',
    glow: 'rgba(24,119,242,0.45)',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.9v2.2h3.3l-.5 3.5H14v8.4C19.6 23.1 24 18.1 24 12.1z" />
      </svg>
    ),
  },
]

// Project a 3-D world position to 2-D container-relative pixels.
function worldToLocal(
  worldPos: { x: number; y: number; z: number },
  camera: any,
  containerEl: HTMLElement,
  canvas: HTMLCanvasElement,
): { x: number; y: number } | null {
  try {
    const pm = camera.projectionMatrix.elements
    const vm = camera.matrixWorldInverse.elements

    const { x, y, z } = worldPos

    // View-space
    const vx = vm[0]*x + vm[4]*y + vm[8]*z + vm[12]
    const vy = vm[1]*x + vm[5]*y + vm[9]*z + vm[13]
    const vz = vm[2]*x + vm[6]*y + vm[10]*z + vm[14]
    const vw = vm[3]*x + vm[7]*y + vm[11]*z + vm[15]

    // Clip-space
    const cx = pm[0]*vx + pm[4]*vy + pm[8]*vz + pm[12]*vw
    const cy = pm[1]*vx + pm[5]*vy + pm[9]*vz + pm[13]*vw
    const cw = pm[3]*vx + pm[7]*vy + pm[11]*vz + pm[15]*vw

    if (Math.abs(cw) < 1e-6) return null

    const ndcX = cx / cw
    const ndcY = cy / cw

    // Canvas CSS rect (may differ from canvas pixel size due to device pixel ratio)
    const canvasRect = canvas.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()

    const screenX = (ndcX + 1) / 2 * canvasRect.width + (canvasRect.left - containerRect.left)
    const screenY = (-ndcY + 1) / 2 * canvasRect.height + (canvasRect.top - containerRect.top)

    return { x: screenX, y: screenY }
  } catch {
    return null
  }
}

interface Props {
  splineApp: Application | null
  splineLoaded: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function SocialProtectionOverlay({ splineApp, splineLoaded, containerRef }: Props) {
  // x/y are in container-local pixels; null = use centered fallback
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!splineLoaded || !splineApp) return

    // Delay logo entrance so the bot is fully visible first
    const showTimer = setTimeout(() => setVisible(true), 600)

    const app = splineApp as any
    const camera = app.camera
    const renderer = app._renderer ?? app.renderer
    const canvas: HTMLCanvasElement | undefined = renderer?.domElement

    if (!camera || !canvas || !containerRef.current) return

    // Discover hand objects — try several common naming conventions
    const allObjects = splineApp.getAllObjects()

    const hands = allObjects.filter((o) =>
      /hand|palm|wrist|finger|arm/i.test(o.name)
    )

    // Always log so we can tune the name filter
    console.log('[Spline] ALL object names:', allObjects.map((o) => o.name).join(', '))
    console.log('[Spline] hand candidates:', hands.map((o) => o.name).join(', '))

    if (hands.length === 0) {
      // No hands found — fall back to static centre; still show logos
      return () => clearTimeout(showTimer)
    }

    const track = () => {
      const container = containerRef.current
      if (!container) return

      // Midpoint across all hand objects in world space
      let sumX = 0, sumY = 0, sumZ = 0
      for (const h of hands) {
        sumX += h.position.x
        sumY += h.position.y
        sumZ += h.position.z
      }
      const mid = { x: sumX / hands.length, y: sumY / hands.length, z: sumZ / hands.length }

      const pt = worldToLocal(mid, camera, container, canvas)
      if (pt) setCenter(pt)

      rafRef.current = requestAnimationFrame(track)
    }

    rafRef.current = requestAnimationFrame(track)

    return () => {
      clearTimeout(showTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [splineLoaded, splineApp, containerRef])

  if (!visible) return null

  // If we have a tracked position use absolute px, otherwise fall back to
  // a percentage anchor that sits at hand level (≈58 % down, centred).
  const tracked = center !== null

  return (
    <div
      style={
        tracked
          ? {
              position: 'absolute',
              left: center.x,
              top: center.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              pointerEvents: 'none',
            }
          : {
              position: 'absolute',
              left: '50%',
              top: '58%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              pointerEvents: 'none',
            }
      }
    >
      {/* protective dome — wide to span between the hands */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          position: 'absolute',
          width: 360,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
          border: '1px solid rgba(59,130,246,0.08)',
          pointerEvents: 'none',
        }}
      />

      {/* 2-row × 3-col grid — wider gap so logos span between the hands */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 52px)',
          gridTemplateRows: 'repeat(2, 52px)',
          gap: '22px',
        }}
      >
        {PLATFORMS.map((platform, i) => (
          <LogoBubble key={platform.name} platform={platform} index={i} />
        ))}
      </div>
    </div>
  )
}

function LogoBubble({
  platform,
  index,
}: {
  platform: typeof PLATFORMS[0]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        type: 'spring',
        stiffness: 220,
        damping: 16,
      }}
      style={{ position: 'relative' }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.18,
        }}
      >
        <div
          title={platform.name}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(5,5,15,0.7)',
            border: `1.5px solid ${platform.color}50`,
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: platform.color,
            boxShadow: `0 0 10px ${platform.glow}, 0 0 24px ${platform.glow}`,
          }}
        >
          <platform.Icon />
        </div>

        {/* pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.65], opacity: [0.5, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: index * 0.22,
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${platform.color}`,
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </motion.div>
  )
}
