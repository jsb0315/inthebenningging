import { useState } from 'react'
import { Rnd } from 'react-rnd'
import './RotaryDial.css'
import '../components/RotaryDial/DialCSS.css'

import Dial from '../components/RotaryDial/Dial'
const EmptySlot = () => <></>

function RotaryDial() {
	const [activeId, setActiveId] = useState<string | null>(null)
	const [panels, setPanels] = useState([
		{ id: 'nav', title: 'Nav', x: 420, y: 32, width: 260, height: 150, node: <EmptySlot /> },
		{ id: 'cta', title: 'CTA', x: 708, y: 32, width: 220, height: 150, node: <EmptySlot /> },
		{ id: 'grid', title: 'Grid', x: 36, y: 276, width: 520, height: 320, node: <EmptySlot /> },
		{ id: 'aside', title: 'Aside', x: 588, y: 220, width: 300, height: 376, node: <EmptySlot /> },
		{ id: 'footer', title: 'Footer', x: 36, y: 620, width: 740, height: 170, node: <EmptySlot /> },
		{ id: 'hero', title: 'Hero', x: 36, y: 32, width: 400, height: 400, node: <Dial /> },
	])

	const updatePanel = (id: string, next: Partial<(typeof panels)[number]>) => {
		setPanels((prev) => prev.map((panel) => (panel.id === id ? { ...panel, ...next } : panel)))
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
							<div className="rotary-panel__body">{panel.node}</div>
						</div>
					</Rnd>
				))}
			</section>
		</main>
	)
}

export default RotaryDial