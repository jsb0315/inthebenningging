import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

function ExampleScrollStory() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <motion.main
      key="example-3"
      className="view"
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
    >
      <section className="hero-block compact">
        <p className="eyebrow">Example 3</p>
        <h1>Scroll Story</h1>
      </section>

      <div className="progress-track" aria-hidden="true">
        <motion.span style={{ width }} />
      </div>

      <section className="story-wrap">
        {['Hook', 'Build', 'Reveal'].map((step, i) => (
          <motion.article
            key={step}
            className="story-card"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
          >
            <p className="eyebrow">Section {i + 1}</p>
            <h2>{step}</h2>
            <p>
              Blend scroll-linked progress bars with reveal-on-view motion to
              keep readers oriented through long-form pages.
            </p>
          </motion.article>
        ))}
      </section>
    </motion.main>
  )
}

export default ExampleScrollStory
