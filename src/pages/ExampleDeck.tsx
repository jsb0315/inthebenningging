import { useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'

function ExampleDeck() {
  const shouldReduceMotion = useReducedMotion()
  const items = useMemo(
    () => [
      {
        id: 'a',
        title: 'North Light',
        note: 'Shared layout animation with interactive card focus.',
      },
      {
        id: 'b',
        title: 'Signal Peak',
        note: 'Drag any card to test gesture velocity and momentum feel.',
      },
      {
        id: 'c',
        title: 'Coastline',
        note: 'Animate detail panel by switching active card state.',
      },
    ],
    [],
  )
  const [activeId, setActiveId] = useState(items[0].id)

  const active = items.find((item) => item.id === activeId) ?? items[0]

  return (
    <motion.main
      key="example-2"
      className="view"
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
    >
      <section className="hero-block compact">
        <p className="eyebrow">Example 2</p>
        <h1>Morphing Deck</h1>
      </section>

      <LayoutGroup>
        <section className="deck-wrap">
          <div className="deck-list">
            {items.map((item) => (
              <motion.button
                type="button"
                key={item.id}
                layout
                drag="x"
                dragConstraints={{ left: -20, right: 20 }}
                whileTap={{ scale: 0.97 }}
                className={`deck-card ${activeId === item.id ? 'active' : ''}`}
                onClick={() => setActiveId(item.id)}
              >
                <h2>{item.title}</h2>
                <p>{item.note}</p>
              </motion.button>
            ))}
          </div>

          <motion.aside className="deck-detail" layout>
            <motion.div
              key={active.id}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="eyebrow">Selected</p>
              <h2>{active.title}</h2>
              <p>{active.note}</p>
            </motion.div>
          </motion.aside>
        </section>
      </LayoutGroup>
    </motion.main>
  )
}

export default ExampleDeck
