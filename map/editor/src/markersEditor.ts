import { formatLocation, GeoPoint, locateCached, MapMarker } from '@randall-plugins/map'
import { listIndex, WidgetEditState, WidgetListEditor } from '@randall/plugin-sdk-editor'
import { mapMarkers } from './mapMarkers'
import { centerOn, mapView } from './mapView'

export const markersEditor: WidgetListEditor = {
  type: 'list',

  newItem: state => MapMarker.create(formatLocation(mapView(state).center)),

  actions: [{
    label:   'markers.actions.center_on_marker',
    icon:    'bullseye-pointer',
    enabled: (state, path) => markerLocation(state, path) != null,
    apply:   (state, path) => {
      const location = markerLocation(state, path)
      if (location == null) { return {} }

      return centerOn(state, location)
    },
  }],
}

function markerLocation(state: WidgetEditState, path: string): GeoPoint | null {
  const index = listIndex(path, 'markers')
  const marker = index == null ? null : mapMarkers(state)[index]
  return marker == null ? null : locateCached(marker.location)
}
