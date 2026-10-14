import { formatLocation, GeoPoint, locateCached, MapProps, MapViewport, MAX_ZOOM } from '@randall-plugins/map'
import { WidgetEdit, WidgetEditState } from '@randall/plugin-sdk-editor'

/** The view as it will be rendered, in widget zoom units, with the locations that have been looked up so far. */
export function mapView(state: WidgetEditState): MapViewport {
  return MapProps.viewport(MapProps.resolve(state.values), locateCached)
}

/** Where the map is shown: the view, or where a bound center has been panned to. */
export function cameraView(state: WidgetEditState): MapViewport {
  const view = mapView(state)
  const pan = panned(state)
  return pan == null ? view : new MapViewport(pan, view.zoom)
}

/** Centers the view on a point, keeping its zoom. A bound center is panned instead. */
export function centerOn(state: WidgetEditState, point: GeoPoint): WidgetEdit {
  if (isCenterLocked(state)) {
    return panTo(state, point)
  }

  return {
    changes: [
      {path: 'center', value: formatLocation(point)},
      {path: 'zoom', value: roundZoom(mapView(state).zoom)},
    ],
  }
}

/** Pans a bound center, which only shows the map elsewhere. Panning back to it clears the pan. */
export function panTo(state: WidgetEditState, point: GeoPoint): WidgetEdit {
  const pan = samePoint(point, mapView(state).center) ? null : point
  return {transient: {[PAN]: pan}}
}

export function panned(state: WidgetEditState): GeoPoint | null {
  if (!isCenterLocked(state)) { return null }
  return (state.transient[PAN] as GeoPoint | null | undefined) ?? null
}

export function isCenterLocked(state: WidgetEditState) {
  return state.isLocked('center')
}

export function isZoomLocked(state: WidgetEditState) {
  return state.isLocked('zoom')
}

export function sameView(a: MapViewport, b: MapViewport) {
  return samePoint(a.center, b.center) && Math.abs(a.zoom - b.zoom) < ZOOM_TOLERANCE
}

export function samePoint(a: GeoPoint, b: GeoPoint) {
  return Math.abs(a.lat - b.lat) < VIEW_TOLERANCE && Math.abs(a.lng - b.lng) < VIEW_TOLERANCE
}

// About 10 cm, more than enough.
export function roundPoint(point: GeoPoint): GeoPoint {
  return {
    lat: Math.round(point.lat * 1e6) / 1e6,
    lng: Math.round(point.lng * 1e6) / 1e6,
  }
}

export function roundZoom(zoom: number) {
  return Math.round(Math.max(0, Math.min(MAX_ZOOM, zoom)) * 100) / 100
}

const PAN = 'pan'

// Just over the rounding above, so that rounded values count as the same view.
const VIEW_TOLERANCE = 2e-6
const ZOOM_TOLERANCE = 0.006
