import { Rnd } from 'react-rnd'
import './RotaryDial.css'
import '../components/RotaryDial/DialCSS.css'

import Dial, { DialBackground, DialPlate } from '../components/RotaryDial/Dial'
import type { RotaryPanel } from '../store/rotaryDialStore'
import { useRotaryDialStore } from '../store/rotaryDialStore'

const EmptySlot = () => null

const DialAngleReadout = () => {
	const rotation = useRotaryDialStore((state) => state.dialRotation)
	const normalized = ((rotation % 360) + 360) % 360

	return (
		<div className="rotary-angle">
			<div className="rotary-angle__value">{normalized.toFixed(1)} deg</div>
			<div className="rotary-angle__label">Dial rotation</div>
		</div>
	)
}

const renderPanelNode = (content: RotaryPanel['content']) => {
	if (content === 'dial-base') return <DialBackground />
	if (content === 'dial-plate') return <DialPlate />
	if (content === 'dial-combo') return <Dial />
	if (content === 'dial-angle') return <DialAngleReadout />
	return <EmptySlot />
}

function RotaryDial() {
	const panels = useRotaryDialStore((state) => state.panels)
	const activeId = useRotaryDialStore((state) => state.activeId)
	const setActiveId = useRotaryDialStore((state) => state.setActiveId)
	const updatePanel = useRotaryDialStore((state) => state.updatePanel)

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
			<section className="rotary-canvas">
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
			</section>
		</main>
	)
}

export default RotaryDial