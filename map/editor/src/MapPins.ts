import { WidgetContentContext, WidgetContentState, widgetPath } from '@randall/plugin-sdk-editor'
import { isEqual } from 'lodash'
import { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { formatLocation, locateCached } from '@randall-plugins/map'
import { createPinElement, setPinSelected } from './createPinElement'
import { mapMarkers } from './mapMarkers'
import { centerOn, isCenterLocked } from './mapView'

// Shows the markers as draggable pins. They're rebuilt when the markers change, which is fine as drags only report at
// their end, but not when the selection does, as dragging a pin selects it. Double-clicking a pin centers the map on it.
export class MapPins {

  constructor(
    private readonly map: MapLibreMap,
    private readonly context: WidgetContentContext,
  ) {}

  private pins: Pin[] = []
  private shown: unknown = null
  private state: WidgetContentState | null = null

  public update(state: WidgetContentState) {
    this.state = state

    const markers = mapMarkers(state)
    const locations = markers.map(it => it == null ? null : locateCached(it.location))
    const locked = markers.map((_, index) => state.isLocked(widgetPath('markers', index, 'location')))
    const shown = [state.values.markers, locations, locked, state.size.width, state.displaySize.width]
    if (!isEqual(shown, this.shown)) {
      this.shown = shown
      this.buildPins(state)
    }

    for (const pin of this.pins) {
      setPinSelected(pin.marker.getElement(), pin.height, state.selection === pin.path)
    }
  }

  public dispose() {
    this.removePins()
  }

  private buildPins(state: WidgetContentState) {
    this.removePins()

    mapMarkers(state).forEach((marker, index) => {
      const location = marker == null ? null : locateCached(marker.location)
      if (marker == null || location == null) { return }

      const path = widgetPath('markers', index)
      const height = Math.max(MIN_PIN_HEIGHT, marker.size * state.displaySize.width / state.size.width)
      const element = createPinElement({
        color:    marker.color,
        height:   height,
        icon:     marker.icon,
        selected: state.selection === path,
      })
      element.addEventListener('click', () => this.context.edit({select: path}))
      element.addEventListener('dblclick', () => this.centerOnPin(index))

      const pin = new Marker({element, anchor: 'bottom', draggable: !state.isLocked(widgetPath(path, 'location'))})
      pin.on('dragstart', () => this.context.edit({select: path}))
      pin.on('dragend', () => {
        const {lat, lng} = pin.getLngLat().wrap()
        this.context.edit({changes: [{path: widgetPath(path, 'location'), value: formatLocation({lat, lng})}]})
      })
      pin.setLngLat([location.lng, location.lat]).addTo(this.map)
      this.pins.push({marker: pin, path, height})
    })
  }

  private centerOnPin(index: number) {
    const state = this.state
    const marker = state == null ? null : mapMarkers(state)[index]
    const location = marker == null ? null : locateCached(marker.location)
    if (state == null || location == null || isCenterLocked(state)) { return }

    this.context.edit({changes: centerOn(state, location)})
  }

  private removePins() {
    this.pins.forEach(it => it.marker.remove())
    this.pins = []
  }

}

interface Pin {
  marker: Marker
  path:   string
  height: number
}

// Kept grabbable, even if the actual marker is tiny or hidden.
const MIN_PIN_HEIGHT = 24
