// @ts-nocheck
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Logo from './Logo'

export default function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      style={styles.footer}
    >
      <div className="container" style={styles.inner}>
        <Logo size={28} showWordmark={true} />
        <p style={styles.copy}>© 2025 Veridian. All rights reserved.</p>
        <div style={styles.links}>
          {['Privacy', 'Terms', 'Docs', 'Status'].map((l) => (
            <motion.a
              key={l}
              href="#"
              style={styles.link}
              whileHover={{ color: '#3b82f6' }}
              transition={{ duration: 0.15 }}
            >
              {l}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.footer>
  )
}

const styles = {
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '40px 0',
    background: '#020208',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 18,
    color: '#60a5fa',
  },
  logoText: {
    fontWeight: 700,
    fontSize: 15,
    color: '#f0f4ff',
  },
  copy: {
    fontSize: 13,
    color: '#334155',
  },
  links: {
    display: 'flex',
    gap: 24,
  },
  link: {
    fontSize: 13,
    color: '#475569',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
}
