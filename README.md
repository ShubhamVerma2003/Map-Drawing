# Map Drawing Application

A web application for drawing and managing geometric features on OpenStreetMap tiles with non-overlapping polygon constraints.

## Features

- **Map Rendering**: OpenStreetMap tiles with smooth zooming and panning
- **Drawing Tools**: Polygon, Circle, Rectangle, and Line String
- **Smart Constraints**: Non-overlapping polygons with auto-trimming
- **Export**: Download all features as GeoJSON
- **Dynamic Limits**: Configurable maximum shapes per type

## Setup & Run

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## How to Use

1. **Select a drawing tool** from the toolbar (Polygon, Circle, Rectangle, or Line)
2. **Draw on the map**:
   - **Polygon**: Click to add points, double-click to finish
   - **Circle**: Click center point, then click edge to set radius
   - **Rectangle**: Click two opposite corners
   - **Line**: Click to add points, double-click to finish
3. **Export**: Click "Export GeoJSON" to download all features
4. **Clear**: Click "Clear All" to remove all features

## Polygon Overlap Logic

The application enforces non-overlapping rules for polygonal features (Polygon, Circle, Rectangle):

1. **Overlap Detection**: Uses Turf.js to detect intersections between the new polygon and existing polygons
2. **Auto-trimming**: When overlaps are detected, the new polygon is trimmed using `turf.difference()` to remove overlapping areas
3. **Full Enclosure Block**: If a polygon fully encloses another (or vice versa), the operation is blocked with an error message
4. **Line Strings**: Line Strings are excluded from overlap rules and can freely cross polygons

The overlap detection compares intersection area with original polygon areas to determine if one fully contains the other.

## Configuration

Edit `src/config.ts` to adjust maximum shapes per type:

```typescript
export const MAX_SHAPES = {
  polygon: 10,
  circle: 5,
  rectangle: 5,
  lineString: 20,
}
```

## Sample GeoJSON Export

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-0.1, 51.5], [-0.1, 51.6], [0, 51.6], [0, 51.5], [-0.1, 51.5]]]
      },
      "properties": {
        "type": "polygon",
        "createdAt": 1234567890
      }
    }
  ]
}
```

## Tech Stack

- React 18 with TypeScript
- Leaflet for map rendering
- Turf.js for spatial operations
- Zustand for state management
- Vite for build tooling

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types.ts        # TypeScript types
│   ├── store.ts        # State management
│   ├── config.ts       # Configuration
│   └── App.tsx         # Main app component
├── package.json
└── README.md
```
