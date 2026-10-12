import { Box } from '@mui/joy'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { sx$ } from './sx'
import { MapEditorModel } from './MapEditorModel'
import { useFittedSize } from './useFittedSize'
import { useMapLibre } from './useMapLibre'
import { usePinMarkers } from './usePinMarkers'

export interface MapViewProps {
  model: MapEditorModel
}

// Shows the map at the widget's aspect ratio, as large as fits.
export const MapView = observer(function MapView(props: MapViewProps) {

  const {model} = props
  const [frameRef, size] = useFittedSize(model.widgetSize)

  // #region Rendering

  function render() {
    return (
      <Box ref={frameRef} sx={$.MapView}>
        {size != null && (
          <MapCanvas model={model} width={size.width} height={size.height}/>
        )}
      </Box>
    )
  }

  // #endregion

  return render()

})

interface MapCanvasProps {
  model:  MapEditorModel
  width:  number
  height: number
}

const MapCanvas = observer(function MapCanvas(props: MapCanvasProps) {

  const {model, width, height} = props
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  const map = useMapLibre(element, model, width, model.widgetSize)
  usePinMarkers(map, model, width)

  function render() {
    return (
      <Box
        ref={setElement}
        sx={[$.canvas, model.canMoveSelectedMarker ? $.pinnable : null]}
        style={{width, height}}
      />
    )
  }

  return render()

})

const $ = sx$({
  MapView: {
    flex:      '1 1 0',
    minHeight: 0,

    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },

  canvas: {
    flex:         '0 0 auto',
    borderRadius: 'sm',
    overflow:     'hidden',
    boxShadow:    t => `0 0 0 1px ${t.vars.palette.divider}`,
  },

  pinnable: {
    '& .maplibregl-canvas-container': {
      cursor: 'crosshair',
    },
  },
})
