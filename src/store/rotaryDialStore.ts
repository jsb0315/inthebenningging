import { create } from 'zustand'

type PanelContent = 'empty' | 'dial-base' | 'dial-plate' | 'dial-combo' | 'dial-angle'

export type RotaryPanel = {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  content: PanelContent
}

type RotaryDialState = {
  panels: RotaryPanel[]
  activeId: string | null
  dialRotation: number
  isDragging: boolean
  dragOwnerId: string | null
  setActiveId: (id: string | null) => void
  updatePanel: (id: string, next: Partial<RotaryPanel>) => void
  setDialRotation: (rotation: number) => void
  startDialDrag: (ownerId: string) => void
  stopDialDrag: () => void
}

const initialPanels: RotaryPanel[] = [
  { id: 'dial-base', title: 'Dial Base', x: 36, y: 32, width: 360, height: 360, content: 'dial-base' },
  { id: 'dial-plate', title: 'Dial Plate', x: 420, y: 32, width: 360, height: 360, content: 'dial-plate' },
  { id: 'dial-combo', title: 'Dial Assembled', x: 804, y: 32, width: 380, height: 380, content: 'dial-combo' },
  { id: 'dial-angle', title: 'Dial Angle', x: 1200, y: 32, width: 220, height: 140, content: 'dial-angle' },
  { id: 'grid', title: 'Grid', x: 36, y: 420, width: 520, height: 320, content: 'empty' },
  { id: 'aside', title: 'Aside', x: 588, y: 420, width: 300, height: 360, content: 'empty' },
  { id: 'footer', title: 'Footer', x: 36, y: 760, width: 740, height: 170, content: 'empty' },
]

export const useRotaryDialStore = create<RotaryDialState>((set) => ({
  panels: initialPanels,
  activeId: null,
  dialRotation: 0,
  isDragging: false,
  dragOwnerId: null,
  setActiveId: (id) => set({ activeId: id }),
  updatePanel: (id, next) =>
    set((state) => ({
      panels: state.panels.map((panel) => (panel.id === id ? { ...panel, ...next } : panel)),
    })),
  setDialRotation: (rotation) => set({ dialRotation: rotation }),
  startDialDrag: (ownerId) => set({ isDragging: true, dragOwnerId: ownerId }),
  stopDialDrag: () => set({ isDragging: false, dragOwnerId: null }),
}))
