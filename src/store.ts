import { create } from 'zustand'
import { DrawingState, DrawingMode, MapFeature } from './types'

interface Store extends DrawingState {
  setMode: (mode: DrawingMode) => void
  addFeature: (feature: MapFeature) => void
  removeFeature: (id: string) => void
  setTempFeature: (feature: MapFeature | null) => void
  clearAll: () => void
}

export const useStore = create<Store>((set) => ({
  mode: null,
  features: [],
  tempFeature: null,
  setMode: (mode) => set({ mode }),
  addFeature: (feature) =>
    set((state) => ({
      features: [...state.features, feature],
      tempFeature: null,
    })),
  removeFeature: (id) =>
    set((state) => ({
      features: state.features.filter((f) => f.id !== id),
    })),
  setTempFeature: (feature) => set({ tempFeature: feature }),
  clearAll: () => set({ features: [], tempFeature: null, mode: null }),
}))
