import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #818cf8 100%)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    />
  )
}
