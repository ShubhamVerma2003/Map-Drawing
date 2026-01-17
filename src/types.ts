import { Feature, Geometry } from 'geojson'

export type DrawingMode = 'polygon' | 'circle' | 'rectangle' | 'lineString' | null

export interface MapFeature extends Feature {
  id: string
  properties: {
    type: DrawingMode
    createdAt: number
  }
}

export interface DrawingState {
  mode: DrawingMode
  features: MapFeature[]
  tempFeature: MapFeature | null
}
