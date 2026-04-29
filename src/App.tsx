import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ExampleDeck from './pages/ExampleDeck'
import ExampleScrollStory from './pages/ExampleScrollStory'
import ExampleStagger from './pages/ExampleStagger'
import FyouPage from './pages/FyouPage'
import HomePage from './pages/HomePage'
import RotaryDialPage from './pages/RotaryDial'
import { normalizeHash, pageCards, type RouteKey, updateHash } from './routes'
import './App.css'

function Header({ onNavigate }: { onNavigate: (path: RouteKey) => void }) {
  return (
    <header className="app-header">
      <button className="brand" onClick={() => onNavigate('/')} type="button">
        motion-lab
      </button>
      <nav aria-label="Main navigation">
        {pageCards.map((page) => (
          <button
            key={page.path}
            type="button"
            className="ghost-link"
            onClick={() => onNavigate(page.path)}
          >
            {page.path.startsWith('/example-')
              ? page.path.replace('/example-', 'ex.')
              : page.path.replace('/', '')}
          </button>
        ))}
      </nav>
    </header>
  )
}

function App() {
  const [route, setRoute] = useState<RouteKey>(() =>
    typeof window !== 'undefined' ? normalizeHash(window.location.hash) : '/',
  )

  useEffect(() => {
    if (window.location.hash.length === 0) {
      updateHash('/')
    }

    const onHashChange = () => {
      setRoute(normalizeHash(window.location.hash))
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (path: RouteKey) => {
    if (normalizeHash(window.location.hash) === path) return
    updateHash(path)
  }

  const content =
    route === '/example-1' ? (
      <ExampleStagger />
    ) : route === '/example-2' ? (
      <ExampleDeck />
    ) : route === '/example-3' ? (
      <ExampleScrollStory />
    ) : route === '/fyou' ? (
      <FyouPage />
    ) : route === '/rotary-dial' ? (
      <RotaryDialPage />
    ) : (
      <HomePage onNavigate={navigate} />
    )

  if (route === '/fyou') {
    return <AnimatePresence mode="wait">{content}</AnimatePresence>
  }

  return (
    <div className="app-shell">
      <Header onNavigate={navigate} />
      <AnimatePresence mode="wait">{content}</AnimatePresence>
    </div>
  )
}

export default App
