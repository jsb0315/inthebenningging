import { motion, useReducedMotion } from 'framer-motion'
import { pageCards, type RouteKey } from '../routes'

type HomePageProps = {
  onNavigate: (path: RouteKey) => void
}

function HomePage({ onNavigate }: HomePageProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.main
      key="home"
      className="view mx-auto w-full max-w-6xl"
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <section className="hero-block px-2 sm:px-4">
        <p className="eyebrow">GitHub Pages Starter</p>
        <h1 className="tracking-tight">Framer Motion Subpage Examples</h1>
        <p className="hero-copy text-balance">
          Single repository deployment friendly app with hash routes. Pick a demo
          and use it as a seed for portfolio pages, product intros, or campaign
          microsites.
        </p>
      </section>

      <section className="card-grid mt-8">
        {pageCards.map((page, index) => (
          <motion.article
            key={page.path}
            className="route-card ring-1 ring-white/35"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 22 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.45 }}
            whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
          >
            <h2>{page.title}</h2>
            <p>{page.blurb}</p>
            <button type="button" onClick={() => onNavigate(page.path)}>
              Open Demo
            </button>
          </motion.article>
        ))}
      </section>
    </motion.main>
  )
}

export default HomePage
