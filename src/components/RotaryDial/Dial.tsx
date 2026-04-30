import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react'
import { useEffect, useId, useMemo, useRef } from 'react'
import { useRotaryDialStore } from '../../store/rotaryDialStore'

const count = 14
const circleSize = 45
const dialSize = 300

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
  const dragStartAngleRef = useRef(0)
  const dragStartRotationRef = useRef(0)
  const rotation = useRotaryDialStore((state) => state.dialRotation)
  const isDragging = useRotaryDialStore((state) => state.isDragging)
  const dragOwnerId = useRotaryDialStore((state) => state.dragOwnerId)
  const setDialRotation = useRotaryDialStore((state) => state.setDialRotation)
  const startDialDrag = useRotaryDialStore((state) => state.startDialDrag)
  const stopDialDrag = useRotaryDialStore((state) => state.stopDialDrag)

  useEffect(() => {
    if (!isDragging || dragOwnerId !== plateInstanceId) return

    const handlePointerMove = (event: PointerEvent) => {
      if (!dialRef.current) return
      const rect = dialRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const angle = Math.atan2(event.clientY - cy, event.clientX - cx)
      const delta = angle - dragStartAngleRef.current
      setDialRotation(dragStartRotationRef.current + (delta * 180) / Math.PI)
    }

    const handlePointerUp = () => {
      stopDialDrag()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dialRef, dragOwnerId, isDragging, plateInstanceId, setDialRotation, stopDialDrag])

  const handlePointerDown = (event: ReactPointerEvent<SVGCircleElement>) => {
    if (!dialRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = dialRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    dragStartAngleRef.current = Math.atan2(event.clientY - cy, event.clientX - cx)
    dragStartRotationRef.current = rotation
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
    </DialStage>
  )
}

const Dial = () => {
  const dialRef = useRef<HTMLDivElement | null>(null)

  return (
    <DialStage dialRef={dialRef}>
      <DialBackgroundLayer />
      <DialPlateLayer dialRef={dialRef} />
    </DialStage>
  )
}

export default Dial