import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react'
import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { useRotaryDialStore } from '../../store/rotaryDialStore'

const count = 14
const circleSize = 46
const dialSize = 300
const totalDialAngle = 300  // 0부터 finger stop까지의 총 회전 각도
const returnSpeedDegPerSec = 360 
const returnPulseStep = 360 / 14
const returnPulseStartDeg = returnPulseStep * 3;

const useDialGeometry = () =>
  useMemo(() => {
    const center = dialSize / 2
    const radius = dialSize * 0.38
    const angleOffset = ((2 * Math.PI) / count) / 2
    const holes = Array.from({ length: count }, (_, i) => {
      const angle = (2 * Math.PI * i) / count + angleOffset
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      }
    })

    return { holes }
  }, [])

const DialStage = ({ children, dialRef }: { children: ReactNode; dialRef?: RefObject<HTMLDivElement | null> }) => (
  <div
    className="dial"
    ref={dialRef}
    style={{
      width: dialSize,
      height: dialSize,
    }}
  >
    {children}
  </div>
)

const DialBackgroundLayer = () => {
  const { holes } = useDialGeometry()

  return (
    <div className="dial-layer">
      {holes.map((point, i) => (
        <div
          key={i}
          className="dial-item"
          style={{
            left: point.x,
            top: point.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {i >= 3 && i < 13 ? (
            <div
              className="circle"
              style={{
                width: circleSize,
                height: circleSize,
              }}
            >
              {(13 - i) % 10}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

const DialPlateLayer = ({ dialRef }: { dialRef: RefObject<HTMLDivElement | null>  }) => {
  const { holes } = useDialGeometry()
  const plateInstanceId = useId().replace(/:/g, '')
  const maskId = useId().replace(/:/g, '')
  const prevAngleRef = useRef(0)
  const locked = useRef(false)
  const startPulse = useRef(false)
  const rotationRef = useRef(0)
  const returnFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const rotation = useRotaryDialStore((state) => state.dialRotation)
  const isDragging = useRotaryDialStore((state) => state.isDragging)
  const dragOwnerId = useRotaryDialStore((state) => state.dragOwnerId)
  const setDialRotation = useRotaryDialStore((state) => state.setDialRotation)
  const resetReturnPulse = useRotaryDialStore((state) => state.resetReturnPulse)
  const addReturnPulse = useRotaryDialStore((state) => state.addReturnPulse)
  const finalizeReturnPulse = useRotaryDialStore((state) => state.finalizeReturnPulse)
  const startDialDrag = useRotaryDialStore((state) => state.startDialDrag)
  const stopDialDrag = useRotaryDialStore((state) => state.stopDialDrag)

  function getDeltaAngle(prev: number, curr: number) {
    let delta = curr - prev
    if (delta > Math.PI) delta -= 2 * Math.PI
    if (delta < -Math.PI) delta += 2 * Math.PI
    return delta
  }

  function isNearFive(angle: number, tolerance = 0.15) {
    const FIVE = ((360 - totalDialAngle) * Math.PI) / 180

    let diff = angle - FIVE

    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI

    return Math.abs(diff) < tolerance
  }

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => () => {
    if (returnFrameRef.current !== null) {
      cancelAnimationFrame(returnFrameRef.current)
      returnFrameRef.current = null
    }
  }, [])

  const stopReturnAnimation = useCallback(() => {
    if (returnFrameRef.current !== null) {
      cancelAnimationFrame(returnFrameRef.current)
      returnFrameRef.current = null
    }
    startPulse.current = false
    lastTimeRef.current = 0
  }, [])

  function mapAngle(angle: number) {
    if (angle < returnPulseStartDeg) return 0

    const index = Math.floor((angle - returnPulseStartDeg) / returnPulseStep)
    return (index + 1) * returnPulseStep
  }

  const startReturnAnimation = useCallback(() => {
    stopReturnAnimation()
    resetReturnPulse()

    const lastAngle = rotationRef.current
    const startPulseAngle = mapAngle(lastAngle)
    console.log(startPulseAngle)

    const step = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp
        returnFrameRef.current = requestAnimationFrame(step)
        return
      }

      const dt = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp
      const current = rotationRef.current

      if (current <= 0) {
        finalizeReturnPulse()
        returnFrameRef.current = null
        return
      }

      const delta = -returnSpeedDegPerSec * dt
      const next = Math.max(0, current + delta)
      const applied = next - current
      
      if (next < startPulseAngle) {
        startPulse.current = true
      }
      
      if (startPulse.current) {
        const prevSteps = Math.floor(current / returnPulseStep)
        const nextSteps = Math.floor(next / returnPulseStep)
        const crossed = prevSteps - nextSteps
        if (crossed > 0) {
          addReturnPulse(crossed)
        }
      }

      setDialRotation(applied)
      rotationRef.current = next

      if (next <= 0) {
        finalizeReturnPulse()
        returnFrameRef.current = null
        return
      }

      returnFrameRef.current = requestAnimationFrame(step)
    }

    returnFrameRef.current = requestAnimationFrame(step)
  }, [addReturnPulse, finalizeReturnPulse, resetReturnPulse, setDialRotation, stopReturnAnimation])

  useEffect(() => {
    if (!isDragging || dragOwnerId !== plateInstanceId) return

    const handlePointerMove = (event: PointerEvent) => {
      if (!dialRef.current) return
      const rect = dialRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const angle = Math.atan2(event.clientY - cy, event.clientX - cx)

      const delta = getDeltaAngle(prevAngleRef.current, angle)
      const rotationDelta = (delta * 180) / Math.PI
      if (!locked.current && isNearFive(angle))
        locked.current = true

      if (delta < 0 || locked.current)
        return
     
      setDialRotation(rotationDelta)

      prevAngleRef.current = angle
    }

    const handlePointerUp = () => {
      locked.current = false
      stopDialDrag()
      if (rotationRef.current > 0) {
        startReturnAnimation()
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dialRef, dragOwnerId, isDragging, plateInstanceId, setDialRotation, startReturnAnimation, stopDialDrag])

  const handlePointerDown = (event: ReactPointerEvent<SVGCircleElement>) => {
    if (!dialRef.current) return
    stopReturnAnimation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = dialRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    prevAngleRef.current = Math.atan2(event.clientY - cy, event.clientX - cx)
    rotationRef.current = rotation
    resetReturnPulse()
    startDialDrag(plateInstanceId)
  }

  return (
    <svg
      className="dial-plate"
      width={dialSize}
      height={dialSize}
      viewBox={`0 0 ${dialSize} ${dialSize}`}
      aria-hidden
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <mask id={maskId}>
          <rect width={dialSize} height={dialSize} fill="white" />
          {holes.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={(circleSize + 4) / 2}
              fill={i >= 3 && i < 13 ? 'black' : 'white'}
            />
          ))}
        </mask>
      </defs>
      <rect className="dial-plate__face" width={dialSize} height={dialSize} mask={`url(#${maskId})`} />
      <g className="dial-plate__handles">
        {holes.map((point, i) =>
          i >= 3 && i < 13 ? (
            <circle
              key={i}
              className="dial-plate__handle"
              cx={point.x}
              cy={point.y}
              r={(circleSize + 4) / 2}
              fill="transparent"
              onPointerDown={handlePointerDown}
            />
          ) : null
        )}
      </g>
    </svg>
  )
}

const DialFingerStop = () => {

  return (
    <div className="dial-fingerstop"/>
  )
}

export const DialBackground = () => (
  <DialStage>
    <DialBackgroundLayer />
  </DialStage>
)

export const DialPlate = () => {
  const dialRef = useRef<HTMLDivElement | null>(null)

  return (
    <DialStage dialRef={dialRef}>
      <DialPlateLayer dialRef={dialRef} />
      <DialFingerStop />
    </DialStage>
  )
}

const Dial = () => {
  const dialRef = useRef<HTMLDivElement | null>(null)

  return (
    <DialStage dialRef={dialRef}>
      <DialBackgroundLayer />
      <DialPlateLayer dialRef={dialRef} />
      <DialFingerStop />
    </DialStage>
  )
}

export default Dial