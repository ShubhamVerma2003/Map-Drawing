import { useStore } from '../store'
import { DrawingMode } from '../types'
import { MAX_SHAPES } from '../config'
import { exportToGeoJSON } from '../utils/export'

export default function Toolbar() {
  const { mode, setMode, features, clearAll } = useStore()

  const getCount = (type: DrawingMode) => {
    return features.filter((f) => f.properties.type === type).length
  }

  const canDraw = (type: DrawingMode) => {
    if (!type) return false
    return getCount(type) < MAX_SHAPES[type]
  }

  const handleExport = () => {
    exportToGeoJSON(features)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '200px',
      }}
    >
      <div
        style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#333',
        }}
      >
        Drawing Tools
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => setMode(mode === 'polygon' ? null : 'polygon')}
          disabled={!canDraw('polygon')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: mode === 'polygon' ? '#3388ff' : '#f0f0f0',
            color: mode === 'polygon' ? 'white' : '#333',
            cursor: canDraw('polygon') ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            opacity: canDraw('polygon') ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          Polygon ({getCount('polygon')}/{MAX_SHAPES.polygon})
        </button>

        <button
          onClick={() => setMode(mode === 'circle' ? null : 'circle')}
          disabled={!canDraw('circle')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: mode === 'circle' ? '#3388ff' : '#f0f0f0',
            color: mode === 'circle' ? 'white' : '#333',
            cursor: canDraw('circle') ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            opacity: canDraw('circle') ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          Circle ({getCount('circle')}/{MAX_SHAPES.circle})
        </button>

        <button
          onClick={() => setMode(mode === 'rectangle' ? null : 'rectangle')}
          disabled={!canDraw('rectangle')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: mode === 'rectangle' ? '#3388ff' : '#f0f0f0',
            color: mode === 'rectangle' ? 'white' : '#333',
            cursor: canDraw('rectangle') ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            opacity: canDraw('rectangle') ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          Rectangle ({getCount('rectangle')}/{MAX_SHAPES.rectangle})
        </button>

        <button
          onClick={() => setMode(mode === 'lineString' ? null : 'lineString')}
          disabled={!canDraw('lineString')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: mode === 'lineString' ? '#3388ff' : '#f0f0f0',
            color: mode === 'lineString' ? 'white' : '#333',
            cursor: canDraw('lineString') ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            opacity: canDraw('lineString') ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          Line ({getCount('lineString')}/{MAX_SHAPES.lineString})
        </button>
      </div>

      <div
        style={{
          borderTop: '1px solid #e0e0e0',
          marginTop: '8px',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          onClick={handleExport}
          disabled={features.length === 0}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#28a745',
            color: 'white',
            cursor: features.length > 0 ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            opacity: features.length > 0 ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          Export GeoJSON
        </button>

        <button
          onClick={clearAll}
          disabled={features.length === 0}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: features.length > 0 ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            opacity: features.length > 0 ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          Clear All
        </button>
      </div>

      {mode && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#1976d2',
          }}
        >
          {mode === 'polygon' && 'Click to add points, double-click to finish'}
          {mode === 'circle' && 'Click center, then click edge to set radius'}
          {mode === 'rectangle' && 'Click two corners to create rectangle'}
          {mode === 'lineString' && 'Click to add points, double-click to finish'}
        </div>
      )}
    </div>
  )
}
