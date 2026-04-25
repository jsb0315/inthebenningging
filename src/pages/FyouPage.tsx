import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const expoEase = (t: number) => {
  const k = 5
  return (Math.exp(k * t) - 1) / (Math.exp(k) - 1)
}

function FyouPage() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)

  const x = useSpring(targetX, { stiffness: 85, damping: 18, mass: 0.9 })
  const y = useSpring(targetY, { stiffness: 85, damping: 18, mass: 0.9 })

  const moveToCenter = useCallback(() => {
    targetX.set(0)
    targetY.set(0)
  }, [targetX, targetY])

  const moveToPointer = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current
    if (!stage) return

    const rect = stage.getBoundingClientRect()
    const pointerX = clientX - rect.left - rect.width / 2
    const pointerY = clientY - rect.top - rect.height / 2

    // Slightly bias toward the pointer for a sticky feel while preserving smoothness.
    targetX.set(pointerX)
    targetY.set(pointerY)
  }, [targetX, targetY])

  useLayoutEffect(() => {
    moveToCenter()
  }, [moveToCenter])

  useEffect(() => {
    const onResize = () => moveToCenter()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [moveToCenter])

  return (
    <motion.main
      key="fyou"
      ref={stageRef}
      className="relative h-dvh w-full touch-none overflow-hidden overscroll-none bg-white"
      onPointerDown={(event) => moveToPointer(event.clientX, event.clientY)}
      onPointerMove={(event) => moveToPointer(event.clientX, event.clientY)}
      onPointerLeave={moveToCenter}
      onPointerUp={moveToCenter}
      onPointerCancel={moveToCenter}
      onTouchStart={(event) => {
        const touch = event.touches[0]
        if (!touch) return
        moveToPointer(touch.clientX, touch.clientY)
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0]
        if (!touch) return
        event.preventDefault()
        moveToPointer(touch.clientX, touch.clientY)
      }}
      onTouchEnd={moveToCenter}
      onTouchCancel={moveToCenter}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 select-none text-9xl sm:text-9xl"
        style={{ x, y }}
        initial={{ scale: 0.1, opacity: 0.5, filter: 'blur(14px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{
          duration: 10,
          ease: expoEase,
        }}
      >
        <motion.span
          className="block -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: [0, -2, 1, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
        🖕
        </motion.span>
      </motion.div>
    </motion.main>
  )
}

export default FyouPage
