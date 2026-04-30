import { create } from 'zustand'

type PanelContent = 'empty' | 'dial-base' | 'dial-plate' | 'dial-combo' | 'dial-angle' | 'dial-pulses'

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
  returnPulseCount: number
  pulseHistory: number[]
  isDragging: boolean
  dragOwnerId: string | null
  setActiveId: (id: string | null) => void
  updatePanel: (id: string, next: Partial<RotaryPanel>) => void
  setDialRotation: (delta: number) => void
  resetReturnPulse: () => void
  addReturnPulse: (count?: number) => void
  finalizeReturnPulse: () => void
  startDialDrag: (ownerId: string) => void
  stopDialDrag: () => void
}

const initialPanels: RotaryPanel[] = [
  { id: 'dial-base', title: 'Dial Base', x: 36, y: 32, width: 360, height: 360, content: 'dial-base' },
  { id: 'dial-plate', title: 'Dial Plate', x: 420, y: 32, width: 360, height: 360, content: 'dial-plate' },
  { id: 'dial-combo', title: 'Dial Assembled', x: 804, y: 32, width: 360, height: 360, content: 'dial-combo' },
  { id: 'dial-angle', title: 'Dial Angle', x: 1200, y: 32, width: 220, height: 140, content: 'dial-angle' },
  { id: 'dial-pulses', title: 'Return Pulses', x: 1200, y: 188, width: 220, height: 220, content: 'dial-pulses' },
]

export const useRotaryDialStore = create<RotaryDialState>((set) => ({
  panels: initialPanels,
  activeId: null,
  dialRotation: 0,
  returnPulseCount: 0,
  pulseHistory: [],
  isDragging: false,
  dragOwnerId: null,
  setActiveId: (id) => set({ activeId: id }),
  updatePanel: (id, next) =>
    set((state) => ({
      panels: state.panels.map((panel) => (panel.id === id ? { ...panel, ...next } : panel)),
    })),
  setDialRotation: (delta) => set((state) => ({ dialRotation: state.dialRotation + delta })),
  resetReturnPulse: () => set({ returnPulseCount: 0 }),
  addReturnPulse: (count = 1) =>
    set((state) => ({ returnPulseCount: state.returnPulseCount + count })),
  finalizeReturnPulse: () =>
    set((state) => ({
      pulseHistory: state.returnPulseCount === 0 ? state.pulseHistory : [...state.pulseHistory, state.returnPulseCount],
      returnPulseCount: 0,
    })),
  startDialDrag: (ownerId) => set({ isDragging: true, dragOwnerId: ownerId }),
  stopDialDrag: () => set({ isDragging: false, dragOwnerId: null }),
}))
