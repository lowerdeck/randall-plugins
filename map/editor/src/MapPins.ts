import { formatLocation, locateCached, MapProps, markerViewBox } from '@randall-plugins/map'
import { widgetPath, WidgetPreviewContext, WidgetPreviewState } from '@randall/plugin-sdk-editor'
import { isEqual } from 'lodash'
import { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { centeredGrid } from './centeredGrid'
import { createPinElement, setPinSelected } from './createPinElement'
import { mapMarkers } from './mapMarkers'
import { centerOn, isCenterLocked, mapView, samePoint } from './mapView'

// Shows the markers as draggable pins. They're rebuilt when the markers change, which is fine as drags only report at
// their end, but not when the selection does, as dragging a pin selects it. Double-clicking a pin centers the map on it.
// Bound pins at a bound center stay in the center while looking around, as they'd move along with the bound values.
export class MapPins {

  constructor(
    private readonly map: MapLibreMap,
    private readonly context: WidgetPreviewContext,
  ) {
    map.on('move', this.followCenter)
  }

  private pins: Pin[] = []
  private shown: unknown = null
  private state: WidgetPreviewState | null = null

  public update(state: WidgetPreviewState) {
    this.state = state

    const markers = mapMarkers(state)
    const locations = markers.map(it => it == null ? null : locateCached(it.location))
    const locked = markers.map((_, index) => state.isLocked(widgetPath('markers', index, 'location')))
    const centered = isCenterLocked(state) ? mapView(state).center : null
    const shown = [state.values.markers, locations, locked, centered, state.size.width, state.displaySize.width]
    if (!isEqual(shown, this.shown)) {
      this.shown = shown
      this.buildPins(state)
    }

    for (const pin of this.pins) {
      setPinSelected(pin.marker.getElement(), pin.height, state.selection === pin.path)
    }
  }

  public dispose() {
    this.map.off('move', this.followCenter)
    this.removePins()
  }

  private buildPins(state: WidgetPreviewState) {
    this.removePins()
    const center = isCenterLocked(state) ? mapView(state).center : null

    mapMarkers(state).forEach((marker, index) => {
      if (marker == null) { return }

      const locationCandidate = marker == null ? null : locateCached(marker.location)
      const location = locationCandidate ?? MapProps.defaultCenter()

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

      const locked = state.isLocked(widgetPath(path, 'location'))
      const centered = locked && center != null && samePoint(location, center)
      const pin = new Marker({element, anchor: 'bottom', draggable: !locked})
      pin.on('dragstart', () => this.context.edit({select: path}))
      pin.on('dragend', () => {
        const {lat, lng} = pin.getLngLat().wrap()
        this.context.edit({changes: [{path: widgetPath(path, 'location'), value: formatLocation({lat, lng})}]})
      })
      pin.setLngLat(centered ? this.map.getCenter() : [location.lng, location.lat]).addTo(this.map)
      this.pins.push({marker: pin, path, height, centered})
    })

    this.layOutCentered()
  }

  // Pins in the center are shown side by side, rather than on top of each other.
  private layOutCentered() {
    const centered = this.pins.filter(it => it.centered)
    if (centered.length === 0) { return }

    const height = Math.max(...centered.map(it => it.height))
    const [viewWidth, viewHeight] = markerViewBox
    const offsets = centeredGrid(centered.length, height * viewWidth / viewHeight + GRID_GAP, height + GRID_GAP)
    centered.forEach((pin, index) => pin.marker.setOffset(offsets[index]))
  }

  private followCenter = () => {
    const center = this.map.getCenter()
    for (const pin of this.pins) {
      if (pin.centered) { pin.marker.setLngLat(center) }
    }
  }

  private centerOnPin(index: number) {
    const state = this.state
    const marker = state == null ? null : mapMarkers(state)[index]
    const location = marker == null ? null : locateCached(marker.location)
    if (state == null || location == null) { return }

    this.context.edit(centerOn(state, location))
  }

  private removePins() {
    this.pins.forEach(it => it.marker.remove())
    this.pins = []
  }

}

interface Pin {
  marker: Marker
  path:     string
  height:   number
  centered: boolean
}

// Kept grabbable, even if the actual marker is tiny or hidden.
const MIN_PIN_HEIGHT = 24

const GRID_GAP = 4
