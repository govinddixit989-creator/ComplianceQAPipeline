// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

const NAV_LINKS = ['Pipeline', 'Checks', 'Results', 'Metrics']

export default function Navbar({ page = 'home', onNavigate }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={styles.nav}
      >
        <div className="container" style={styles.inner}>
          {/* logo */}
          <motion.div
            style={styles.logo}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => onNavigate?.('home')}
          >
            <Logo size={32} showWordmark={true} />
          </motion.div>

          {/* desktop links — only on home */}
          {page === 'home' && (
            <ul style={styles.links} className="hidden md:flex">
              {NAV_LINKS.map((link) => (
                <motion.li key={link} whileHover={{ color: '#3b82f6' }} style={styles.link}>
                  <a href={`#${link.toLowerCase()}`} style={styles.anchor}>{link}</a>
                </motion.li>
              ))}
            </ul>
          )}

          {/* desktop right actions */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8 }}>
            <motion.button
              onClick={() => onNavigate?.('checker')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                ...styles.trackerBtn,
                background: page === 'checker' ? 'rgba(239,68,68,0.12)' : 'transparent',
                borderColor: page === 'checker' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.1)',
                color: page === 'checker' ? '#fca5a5' : '#64748b',
              }}
            >
              ▶ Checker
            </motion.button>

            <motion.button
              onClick={() => onNavigate?.(page === 'tracker' ? 'home' : 'tracker')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                ...styles.trackerBtn,
                background: page === 'tracker' ? 'rgba(139,92,246,0.15)' : 'transparent',
                borderColor: page === 'tracker' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)',
                color: page === 'tracker' ? '#c4b5fd' : '#64748b',
              }}
            >
              📋 Tracker
            </motion.button>

            {page === 'home' && (
              <motion.button
                style={styles.cta}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Get Started
              </motion.button>
            )}
          </div>

          {/* hamburger */}
          <button
            className="md:hidden"
            onClick={() => setOpen(v => !v)}
            style={styles.burger}
            aria-label="Toggle menu"
          >
            <span style={{ ...styles.burgerLine, transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ ...styles.burgerLine, opacity: open ? 0 : 1 }} />
            <span style={{ ...styles.burgerLine, transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </motion.nav>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={styles.mobileMenu}
          >
            {page === 'home' && NAV_LINKS.map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                style={styles.mobileLink}
                onClick={() => setOpen(false)}
              >
                {link}
              </a>
            ))}
            <button
              style={{ ...styles.mobileLink, background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', color: '#c4b5fd' }}
              onClick={() => { onNavigate?.(page === 'tracker' ? 'home' : 'tracker'); setOpen(false) }}
            >
              {page === 'tracker' ? '← Back to Home' : '📋 Open Tracker'}
            </button>
            {page === 'home' && (
              <button style={styles.mobileCta} onClick={() => setOpen(false)}>Get Started</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(2,2,8,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  inner: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: 64,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  links: { gap: 32, listStyle: 'none' },
  link:  { fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' },
  anchor: { color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' },
  trackerBtn: {
    padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  cta: {
    background: '#3b82f6', color: '#fff', border: 'none',
    borderRadius: 8, padding: '8px 20px', fontWeight: 600,
    fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
  },
  burger: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    gap: 5, width: 36, height: 36, background: 'transparent',
    border: 'none', cursor: 'pointer', padding: 6,
  },
  burgerLine: {
    display: 'block', height: 2, width: '100%',
    background: 'var(--text-secondary)', borderRadius: 2,
    transition: 'transform 0.22s ease, opacity 0.22s ease',
    transformOrigin: 'center',
  },
  mobileMenu: {
    position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
    background: 'rgba(2,2,8,0.97)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column',
    padding: '16px 20px 24px', gap: 4,
  },
  mobileLink: {
    color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: 16, fontWeight: 500, padding: '12px 8px',
    borderRadius: 8, transition: 'color 0.2s, background 0.2s',
    display: 'block',
  },
  mobileCta: {
    marginTop: 8, background: '#3b82f6', color: '#fff',
    border: 'none', borderRadius: 10, padding: '12px 20px',
    fontWeight: 600, fontSize: 15, cursor: 'pointer',
    fontFamily: 'inherit', width: '100%',
  },
}
