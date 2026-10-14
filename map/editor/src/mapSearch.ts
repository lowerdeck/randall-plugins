import { MapMarker } from '@randall-plugins/map'
import { listIndex, WidgetChange, widgetPath, WidgetSearch } from '@randall/plugin-sdk-editor'
import { GeocodeResult } from './GeocodeResult'
import { mapMarkers } from './mapMarkers'
import { isViewLocked, roundPoint } from './mapView'

// Moves the selected (or first) marker to the result, or adds one if there are none, and shows the result.
export const mapSearch: WidgetSearch<GeocodeResult> = {
  placeholder: 'search.placeholder',

  search: (query, host) => host.query<GeocodeResult[]>('geocode', {query}),
  label:  result => result.label,
  key:    result => `${result.label}@${result.center.lat},${result.center.lng}`,

  apply: (result, state) => {
    const changes: WidgetChange[] = []
    const markers = mapMarkers(state)
    const center = roundPoint(result.center)

    let select: string | undefined
    if (markers.length === 0) {
      select = widgetPath('markers', 0)
      changes.push({path: select, value: MapMarker.create(center)})
    } else {
      const index = listIndex(state.selection, 'markers') ?? 0
      changes.push({path: widgetPath('markers', index, 'location'), value: center})
    }

    if (!isViewLocked(state)) {
      if (result.bounds != null) {
        changes.push({path: 'bounds', value: result.bounds})
      } else {
        changes.push(
          {path: 'center', value: center},
          {path: 'zoom', value: SEARCH_RESULT_ZOOM},
          {path: 'bounds', value: null},
        )
      }
    }

    return {changes, select}
  },

  enabled: state => !state.isLocked('markers') || !isViewLocked(state),
}

const SEARCH_RESULT_ZOOM = 14
