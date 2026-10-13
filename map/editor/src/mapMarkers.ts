import { MapMarker } from '@randall-plugins/map'
import { WidgetEditState } from '@randall/plugin-sdk-editor'

/** The markers by their index in the props, which empty entries keep. */
export function mapMarkers(state: WidgetEditState): Array<MapMarker | null> {
  const markers = state.values.markers
  if (!Array.isArray(markers)) { return [] }

  return markers.map(it => it != null && typeof it === 'object' ? MapMarker.resolve(it) : null)
}
