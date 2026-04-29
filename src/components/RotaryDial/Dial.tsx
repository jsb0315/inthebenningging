import { useEffect, useId, useRef, useState } from 'react'

const count = 14
const circleSize = 45
const dialSize = 300

const Dial = () => {
  const maskId = useId().replace(/:/g, '')
  const dialRef = useRef<HTMLDivElement | null>(null)
  const dragStartAngleRef = useRef(0)
  const dragStartRotationRef = useRef(0)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
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

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (event: PointerEvent) => {
      if (!dialRef.current) return
      const rect = dialRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const angle = Math.atan2(event.clientY - cy, event.clientX - cx)
      const delta = angle - dragStartAngleRef.current
      setRotation(dragStartRotationRef.current + (delta * 180) / Math.PI)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging])

  const handlePointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
    if (!dialRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = dialRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    dragStartAngleRef.current = Math.atan2(event.clientY - cy, event.clientX - cx)
    dragStartRotationRef.current = rotation
    setIsDragging(true)
  }

  return (
    <div
      className="dial"
      ref={dialRef}
      style={{
        width: dialSize,
        height: dialSize,
      }}
    >
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
          {i >= 3 && i < 13 && <div
            className="circle"
            style={{
              width: circleSize,
              height: circleSize,
            }}
          >
            {i - 2}
          </div>}
        </div>
      ))}
      
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
              <circle key={i} cx={point.x} cy={point.y} r={(circleSize + 4) / 2} fill={i >= 3 && i < 13 ? "black" : "white"} />
            ))}
          </mask>
        </defs>
        <rect
          className="dial-plate__face"
          width={dialSize}
          height={dialSize}
          mask={`url(#${maskId})`}
        />
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
    </div>
  )
}

export default Dial