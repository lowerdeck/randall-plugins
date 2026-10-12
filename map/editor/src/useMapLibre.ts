import { WidgetSize } from '@randall/widget-sdk'
import { Map as MapLibreMap, MapMouseEvent, RasterTileSource } from 'maplibre-gl'
import { reaction } from 'mobx'
import { useEffect, useState } from 'react'
import { MAX_ZOOM } from '@randall-widgets/map'
import { MapEditorModel } from './MapEditorModel'
import { rasterStyle, tileURLTemplate, TILES_SOURCE } from './rasterStyle'
import { useContinuousRef } from './useContinuousRef'

export function useMapLibre(element: HTMLElement | null, model: MapEditorModel, width: number, widgetSize: WidgetSize): MapLibreMap | null {
  const widthRef = useContinuousRef(width)
  const [map, setMap] = useState<MapLibreMap | null>(null)

  useEffect(() => {
    if (element == null) { return }

    const map = new MapLibreMap({
      container:          element,
      style:              rasterStyle(model.style, model.host),
      center:             [model.center.lng, model.center.lat],
      zoom:               model.toMapZoom(model.zoom, widthRef.current),
      minZoom:            Math.max(MIN_MAP_ZOOM, model.toMapZoom(0, widthRef.current)),
      maxZoom:            Math.min(MAX_MAP_ZOOM, model.toMapZoom(MAX_ZOOM, widthRef.current)),
      transformRequest:   url => model.host.authorizeRequest(url),
      attributionControl: {compact: true},
      trackResize:        false,
      dragRotate:         false,
      pitchWithRotate:    false,
      touchPitch:         false,
    })
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    if (model.viewLocked) {
      disableNavigation(map)
    }

    // Only user gestures carry an original event; resizes and programmatic moves don't.
    map.on('movestart', event => {
      if (event.originalEvent != null) { model.markViewChanged() }
    })
    map.on('moveend', () => {
      model.updateView(map.getCenter().wrap(), map.getZoom(), map.getContainer().clientWidth)
    })
    map.on('click', (event: MapMouseEvent) => {
      // Clicks on the pin itself bubble up to the map too.
      if (event.originalEvent.target instanceof Element && event.originalEvent.target.closest('.maplibregl-marker')) { return }

      const {lat, lng} = event.lngLat.wrap()
      model.moveSelectedMarker({lat, lng})
    })

    model.attachMap(map)
    setMap(map)

    return () => {
      model.detachMap(map)
      map.remove()
      setMap(null)
    }
  }, [element, model, widthRef])

  // Keeps showing the same extent when the dialog or the widget resizes.
  useEffect(() => {
    if (map == null) { return }

    map.resize()
    map.setMinZoom(Math.max(MIN_MAP_ZOOM, model.toMapZoom(0, width)))
    map.setMaxZoom(Math.min(MAX_MAP_ZOOM, model.toMapZoom(MAX_ZOOM, width)))
    map.jumpTo({zoom: model.toMapZoom(model.zoom, width)})
  }, [map, model, width, widgetSize])

  useEffect(() => {
    if (map == null) { return }

    return reaction(() => model.style, style => {
      map.getSource<RasterTileSource>(TILES_SOURCE)?.setTiles([tileURLTemplate(style, model.host)])
    })
  }, [map, model])

  return map
}

function disableNavigation(map: MapLibreMap) {
  map.dragPan.disable()
  map.scrollZoom.disable()
  map.boxZoom.disable()
  map.doubleClickZoom.disable()
  map.keyboard.disable()
  map.touchZoomRotate.disable()
}

const MIN_MAP_ZOOM = -2
const MAX_MAP_ZOOM = 24
