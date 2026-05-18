import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import ScrollProgressBar from './components/ScrollProgressBar'
import CursorGlow from './components/CursorGlow'
import Hero from './components/Hero'
import MetricsBar from './components/MetricsBar'
import PipelineStages from './components/PipelineStages'
import LiveDemo from './components/LiveDemo'
import BentoGrid from './components/BentoGrid'
import ComplianceCards from './components/ComplianceCards'
import ResultsTable from './components/ResultsTable'
import Footer from './components/Footer'
import Tracker from './pages/Tracker'
import Checker from './pages/Checker'

type Page = 'home' | 'tracker' | 'checker'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [page])

  if (page === 'tracker') {
    return (
      <>
        <Navbar page={page} onNavigate={setPage} />
        <Tracker onBack={() => setPage('home')} />
      </>
    )
  }

  if (page === 'checker') {
    return (
      <>
        <Navbar page={page} onNavigate={setPage} />
        <Checker onBack={() => setPage('home')} />
      </>
    )
  }

  return (
    <>
      <ScrollProgressBar />
      <CursorGlow />
      <Navbar page={page} onNavigate={setPage} />
      <main>
        <Hero />
        <MetricsBar />
        <PipelineStages />
        <LiveDemo />
        <BentoGrid />
        <ComplianceCards />
        <ResultsTable />
      </main>
      <Footer />
    </>
  )
}
