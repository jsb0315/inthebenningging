import { useRef, useState, type PointerEvent } from 'react'
import { Rnd } from 'react-rnd'
import './RotaryDial.css'
import '../components/RotaryDial/DialCSS.css'

import Dial, { DialBackground, DialPlate } from '../components/RotaryDial/Dial'
import type { RotaryPanel } from '../store/rotaryDialStore'
import { useRotaryDialStore } from '../store/rotaryDialStore'

const EmptySlot = () => null

const DialAngleReadout = () => {
	const rotation = useRotaryDialStore((state) => state.dialRotation)

	return (
		<div className="rotary-angle">
			<div className="rotary-angle__value">{rotation.toFixed(1)} deg</div>
			<div className="rotary-angle__label">Dial rotation</div>
		</div>
	)
}

const DialPulseReadout = () => {
	const returnPulseCount = useRotaryDialStore((state) => state.returnPulseCount)
	const pulseHistory = useRotaryDialStore((state) => state.pulseHistory)

	return (
		<div className="rotary-pulse">
			<div className="rotary-pulse__value">{returnPulseCount}</div>
			<div className="rotary-pulse__label">Return pulses</div>
			<div className="rotary-pulse__history">
				{pulseHistory.length === 0 ? (
					<span className="rotary-pulse__empty">No pulses yet</span>
				) : (
					<ol className="rotary-pulse__list">
						{[...pulseHistory].reverse().map((count, index) => (
							<li key={`${count}-${index}`}>
								#{pulseHistory.length - index} · {count}
							</li>
						))}
					</ol>
				)}
			</div>
		</div>
	)
}

const renderPanelNode = (content: RotaryPanel['content']) => {
	if (content === 'dial-base') return <DialBackground />
	if (content === 'dial-plate') return <DialPlate />
	if (content === 'dial-combo') return <Dial />
	if (content === 'dial-angle') return <DialAngleReadout />
	if (content === 'dial-pulses') return <DialPulseReadout />
	return <EmptySlot />
}

function RotaryDial() {
	const panels = useRotaryDialStore((state) => state.panels)
	const activeId = useRotaryDialStore((state) => state.activeId)
	const setActiveId = useRotaryDialStore((state) => state.setActiveId)
	const updatePanel = useRotaryDialStore((state) => state.updatePanel)
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
	const [isPanning, setIsPanning] = useState(false)
	const panState = useRef({
		active: false,
		pointerId: -1,
		startX: 0,
		startY: 0,
		originX: 0,
		originY: 0,
	})

	const handleCanvasPointerDown = (event: PointerEvent<HTMLElement>) => {
		if (event.target !== event.currentTarget) return
		const current = panState.current
		current.active = true
		current.pointerId = event.pointerId
		current.startX = event.clientX
		current.startY = event.clientY
		current.originX = panOffset.x
		current.originY = panOffset.y
		event.currentTarget.setPointerCapture(event.pointerId)
		setIsPanning(true)
	}

	const handleCanvasPointerMove = (event: PointerEvent<HTMLElement>) => {
		const current = panState.current
		if (!current.active || current.pointerId !== event.pointerId) return
		const nextX = current.originX + (event.clientX - current.startX)
		const nextY = current.originY + (event.clientY - current.startY)
		setPanOffset({ x: nextX, y: nextY })
	}

	const handleCanvasPointerUp = (event: PointerEvent<HTMLElement>) => {
		const current = panState.current
		if (!current.active || current.pointerId !== event.pointerId) return
		current.active = false
		current.pointerId = -1
		event.currentTarget.releasePointerCapture(event.pointerId)
		setIsPanning(false)
	}

	return (
		<main className="rotary-lab">
			<header className="rotary-header">
				<div>
					<p className="rotary-eyebrow">Visual Debug Sandbox</p>
					<h1 className="rotary-title">Component Layout Lab</h1>
					<p className="rotary-subtitle">
						Drag and resize each box to arrange temporary UI positions while components are under
						construction.
					</p>
				</div>
				<div className="rotary-legend">
					<span>drag</span>
					<span>resize</span>
					<span>snap</span>
				</div>
			</header>
			<section
				className={`rotary-canvas${isPanning ? ' rotary-canvas--panning' : ''}`}
				onPointerDown={handleCanvasPointerDown}
				onPointerMove={handleCanvasPointerMove}
				onPointerUp={handleCanvasPointerUp}
				onPointerLeave={handleCanvasPointerUp}
			>
				<div
					className="rotary-canvas__viewport"
					style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
					onPointerDown={handleCanvasPointerDown}
					onPointerMove={handleCanvasPointerMove}
					onPointerUp={handleCanvasPointerUp}
					onPointerLeave={handleCanvasPointerUp}
				>
					{panels.map((panel) => (
						<Rnd
							key={panel.id}
							bounds="parent"
							minWidth={160}
							minHeight={120}
							size={{ width: panel.width, height: panel.height }}
							position={{ x: panel.x, y: panel.y }}
							dragHandleClassName="rotary-panel__handle"
							className="rotary-panel"
							style={{ zIndex: activeId === panel.id ? 10 : 1 }}
							onDragStart={() => {
								setActiveId(panel.id)
							}}
							onResizeStart={() => {
								setActiveId(panel.id)
							}}
							onDragStop={(_, data) => {
								updatePanel(panel.id, { x: data.x, y: data.y })
							}}
							onResizeStop={(_, __, ref, ___, position) => {
								updatePanel(panel.id, {
									width: ref.offsetWidth,
									height: ref.offsetHeight,
									x: position.x,
									y: position.y,
								})
							}}
						>
							<div className="rotary-panel__whole">
								<div className="rotary-panel__handle">
									<span className="rotary-panel__title">{panel.title}</span>
									<span className="rotary-panel__meta">
										{panel.width}×{panel.height}
									</span>
								</div>
								<div className="rotary-panel__body">{renderPanelNode(panel.content)}</div>
							</div>
						</Rnd>
					))}
				</div>
			</section>
		</main>
	)
}

export default RotaryDial