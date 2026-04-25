import { motion, useReducedMotion } from 'framer-motion'

function ExampleStagger() {
  const shouldReduceMotion = useReducedMotion()
  const stats = [
    { label: 'Spark', value: '24' },
    { label: 'Pulse', value: '89' },
    { label: 'Wave', value: '53' },
    { label: 'Shift', value: '97' },
    { label: 'Drift', value: '68' },
    { label: 'Glow', value: '74' },
  ]

  return (
    <motion.main
      key="example-1"
      className="view"
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
    >
      <section className="hero-block compact">
        <p className="eyebrow">Example 1</p>
        <h1>Stagger Grid</h1>
      </section>
      <motion.section
        className="stats-grid"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.15 },
          },
        }}
      >
        {stats.map((item) => (
          <motion.article
            key={item.label}
            className="stat-card"
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 260, damping: 24 },
              },
            }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          >
            <p>{item.label}</p>
            <strong>{item.value}%</strong>
          </motion.article>
        ))}
      </motion.section>
    </motion.main>
  )
}

export default ExampleStagger
