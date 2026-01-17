export const MAX_SHAPES = {
  polygon: 10,
  circle: 5,
  rectangle: 5,
  lineString: 20,
}

export type ShapeType = keyof typeof MAX_SHAPES
