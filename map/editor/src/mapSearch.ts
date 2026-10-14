import { formatLocation, GeocodeResult, MapMarker, MapViewport } from '@randall-plugins/map'
import { listIndex, WidgetChange, widgetPath, WidgetSearch } from '@randall/plugin-sdk-editor'
import { mapMarkers } from './mapMarkers'
import { isCenterLocked, panTo, roundZoom } from './mapView'

// Moves the selected (or first) marker to the result, or adds one if there are none, and centers on the result. A bound
// center is panned to the result instead.
export const mapSearch: WidgetSearch<GeocodeResult> = {
  placeholder: 'search.placeholder',

  search: (query, host) => host.query<GeocodeResult[]>('geocode', {query}),
  label:  result => result.label,
  key:    result => `${result.label}@${result.center.lat},${result.center.lng}`,

  apply: (result, state) => {
    const changes: WidgetChange[] = []
    const markers = mapMarkers(state)
    const center = formatLocation(result.center)

    let select: string | undefined
    if (markers.length === 0) {
      select = widgetPath('markers', 0)
      changes.push({path: select, value: MapMarker.create(center)})
    } else {
      const index = listIndex(state.selection, 'markers') ?? 0
      changes.push({path: widgetPath('markers', index, 'location'), value: center})
    }

    // Zoomed to fit the result, like a whole country. Bound values are left alone.
    const zoom = result.bounds == null ? SEARCH_RESULT_ZOOM : MapViewport.fitBounds(result.bounds, state.size).zoom
    if (!isCenterLocked(state)) {
      changes.push({path: 'center', value: center})
    }
    changes.push({path: 'zoom', value: roundZoom(zoom)})

    const pan = isCenterLocked(state) ? panTo(state, result.center) : {}
    return {...pan, changes, select}
  },
}

const SEARCH_RESULT_ZOOM = 14
