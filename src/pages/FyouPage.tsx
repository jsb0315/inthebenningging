import { useCallback, useEffect, useRef } from 'react'
import {
	animate,
	motion,
	useAnimationControls,
	useMotionValue,
	useSpring,
} from 'framer-motion'
import type { PointerEvent as ReactPointerEvent } from 'react'

const IDLE_RESET_DELAY_MS = 1000
const STICKINESS_START = 0.1
const STICKINESS_END = 0.8
const MAX_OFFSET_MOUSE = 1000
const MAX_OFFSET_TOUCH = 500

function clampToCircle(x: number, y: number, radius: number) {
	const distance = Math.hypot(x, y)
	if (distance <= radius || distance === 0) {
		return { x, y }
	}

	const scale = radius / distance
	return { x: x * scale, y: y * scale }
}

function FyouPage() {
	const controls = useAnimationControls()
	const rawX = useMotionValue(0)
	const rawY = useMotionValue(0)
	const stickiness = useMotionValue(STICKINESS_START)
	const x = useSpring(rawX, { stiffness: 250, damping: 18, mass: 0.65 })
	const y = useSpring(rawY, { stiffness: 250, damping: 18, mass: 0.65 })
	const idleTimerRef = useRef<number | null>(null)

	const scheduleReset = useCallback((delay = IDLE_RESET_DELAY_MS) => {
		if (idleTimerRef.current !== null) {
			window.clearTimeout(idleTimerRef.current)
		}

		idleTimerRef.current = window.setTimeout(() => {
			rawX.set(0)
			rawY.set(0)
		}, delay)
	}, [rawX, rawY])

	const setStickyPosition = useCallback(
		(clientX: number, clientY: number, pointerType: string) => {
			const centerX = window.innerWidth / 2
			const centerY = window.innerHeight / 2
			const stickyStrength = stickiness.get()
			const offsetX = (clientX - centerX) * stickyStrength
			const offsetY = (clientY - centerY) * stickyStrength
			const maxOffset = pointerType === 'touch' ? MAX_OFFSET_TOUCH : MAX_OFFSET_MOUSE
			const clamped = clampToCircle(offsetX, offsetY, maxOffset)

			rawX.set(clamped.x)
			rawY.set(clamped.y)
			scheduleReset()
		},
		[rawX, rawY, scheduleReset, stickiness],
	)

	useEffect(() => {
		let isAlive = true
		let stopStickinessAnimation: { stop: () => void } | null = null

		const runIntro = async () => {
			stopStickinessAnimation = animate(stickiness, STICKINESS_END, {
				duration: 10,
				ease: [0.7, 0, 0.84, 0],
			})

			await controls.start({
				scale: 1.3,
				rotate: 2520,
				filter: 'blur(0px)',
				opacity: 1,
				transition: {
					duration: 10,
					ease: [0.7, 0, 0.84, 0],
					rotate: {
						duration: 10,
						ease: [0.33, 1, 0.68, 1],
					},
				},
			})

			if (!isAlive) return

			await controls.start({
				scale: 1.5,
				filter: 'blur(0px)',
				transition: {
					duration: 0.1,
					stiffness: 100,
					damping: 20,
					mass: 0,
				},
			})

			await controls.start({
				scale: 1,
				filter: 'blur(0px)',
				transition: {
					type: 'spring',
					stiffness: 300,
					damping: 5,
					mass: 0.4,
				},
			})

			stopStickinessAnimation?.stop()
		}

		runIntro()
		scheduleReset()

		return () => {
			isAlive = false
			stopStickinessAnimation?.stop()
			if (idleTimerRef.current !== null) {
				window.clearTimeout(idleTimerRef.current)
			}
		}
	}, [controls, scheduleReset, stickiness])

	const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		setStickyPosition(event.clientX, event.clientY, event.pointerType)
	}

	const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		setStickyPosition(event.clientX, event.clientY, event.pointerType)
	}

	const onPointerEnd = () => {
		scheduleReset(220)
	}

	return (
		<motion.main
			key="fyou"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.35 }}
			onPointerMove={onPointerMove}
			onPointerDown={onPointerDown}
			onPointerUp={onPointerEnd}
			onPointerCancel={onPointerEnd}
			onPointerLeave={onPointerEnd}
			style={{
				width: '100vw',
				height: '100vh',
				display: 'grid',
				placeItems: 'center',
				background: '#f9f9f9',
				overflow: 'hidden',
				touchAction: 'none',
				userSelect: 'none',
			}}
		>
			<motion.div
				initial={{
					scale: 0.05,
					rotate: 0,
					filter: 'blur(15px)',
					opacity: 0.72,
				}}
				animate={controls}
				style={{
					x,
					y,
					fontSize: 'clamp(15rem, 15vw, 10rem)',
					lineHeight: 1,
					willChange: 'transform, filter',
					cursor: 'default',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
				}}
				aria-hidden="true"
			>
				🖕
			</motion.div>
		</motion.main>
	)
}

export default FyouPage
