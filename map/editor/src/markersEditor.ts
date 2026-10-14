import { GeoPoint, MapMarker } from '@randall-plugins/map'
import { listIndex, WidgetEditState, WidgetListEditor } from '@randall/plugin-sdk-editor'
import { mapMarkers } from './mapMarkers'
import { centerOn, isViewLocked, mapView, roundPoint } from './mapView'

export const markersEditor: WidgetListEditor = {
  type: 'list',

  newItem: state => MapMarker.create(roundPoint(mapView(state).center)),

  actions: [{
    label:   'markers.actions.center_on_marker',
    icon:    'bullseye-pointer',
    enabled: (state, path) => !isViewLocked(state) && markerLocation(state, path) != null,
    apply:   (state, path) => {
      const location = markerLocation(state, path)
      if (location == null) { return {} }

      return {changes: centerOn(state, location)}
    },
  }],
}

function markerLocation(state: WidgetEditState, path: string): GeoPoint | null {
  const index = listIndex(path, 'markers')
  const location = index == null ? null : mapMarkers(state)[index]?.location
  return GeoPoint.is(location) ? location : null
}
