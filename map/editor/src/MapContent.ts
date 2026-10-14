import { MapProps, MapViewport, MAX_ZOOM, scaleZoom } from '@randall-plugins/map'
import {
  listIndex,
  WidgetContentContext,
  WidgetContentInstance,
  WidgetContentState,
  widgetPath,
} from '@randall/plugin-sdk-editor'
import { AttributionControl, Map as MapLibreMap, MapMouseEvent, NavigationControl, RasterTileSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPins } from './MapPins'
import { centerOn, isViewLocked, mapView, roundPoint, roundZoom, sameView } from './mapView'
import {
  RasterPaint,
  rasterPaint,
  rasterStyle,
  TILES_LAYER,
  TILES_SOURCE,
  tileURLTemplate,
} from './rasterStyle'

// An interactive map, showing the same extent as the widget. Params are in widget zoom units, which are converted to
// and from the zoom of the (differently sized) map on screen.
export class MapContent implements WidgetContentInstance {

  constructor(
    container: HTMLElement,
    private readonly context: WidgetContentContext,
    private state: WidgetContentState,
  ) {
    this.view = mapView(state)
    this.map = new MapLibreMap({
      container:          container,
      style:              rasterStyle(this.style, context.host, this.paint),
      center:             [this.view.center.lng, this.view.center.lat],
      zoom:               this.toMapZoom(this.view.zoom),
      minZoom:            this.minZoom,
      maxZoom:            this.maxZoom,
      transformRequest:   url => context.host.authorizeRequest(url),
      attributionControl: false,
      trackResize:        false,
      dragRotate:         false,
      pitchWithRotate:    false,
      touchPitch:         false,

      // Double-clicking pans instead: a zoom is easy to do by accident, and hard to undo.
      doubleClickZoom: false,
    })
    this.map.touchZoomRotate.disableRotation()
    this.map.keyboard.disableRotation()
    if (isViewLocked(state)) {
      disableNavigation(this.map)
    } else {
      // Its buttons pass on their click events, so their zooms count as user gestures, and are kept.
      this.map.addControl(new NavigationControl({showCompass: false}), 'top-right')
    }

    this.map.on('movestart', this.handleMoveStart)
    this.map.on('moveend', this.handleMoveEnd)
    this.map.on('click', this.handleClick)
    this.map.on('dblclick', this.handleDoubleClick)

    this.pins = new MapPins(this.map, context)
    this.pins.update(state)
    this.updateAttribution()
    this.updateCursor()
  }

  private readonly map: MapLibreMap
  private readonly attribution = new AttributionControl({compact: true})
  private readonly pins: MapPins

  /** The view last shown or reported, to tell edits coming back from ones made elsewhere. */
  private view: MapViewport

  private userMoving = false

  public update(state: WidgetContentState) {
    const prev = this.state
    this.state = state

    const resized = (
      prev.displaySize.width !== state.displaySize.width || prev.displaySize.height !== state.displaySize.height ||
      prev.size.width !== state.size.width || prev.size.height !== state.size.height
    )
    if (resized) {
      this.map.resize()
      this.map.setMinZoom(this.minZoom)
      this.map.setMaxZoom(this.maxZoom)
    }

    if (styleOf(prev) !== this.style) {
      this.map.getSource<RasterTileSource>(TILES_SOURCE)?.setTiles([tileURLTemplate(this.style, this.context.host)])
    }
    if (this.map.getLayer(TILES_LAYER) != null) {
      for (const [name, value] of Object.entries(rasterPaint(this.paint))) {
        this.map.setPaintProperty(TILES_LAYER, name, value)
      }
    }

    const view = mapView(state)
    if (resized) {
      this.map.jumpTo(this.cameraFor(view))
    } else if (!sameView(view, this.view)) {
      this.map.easeTo(this.cameraFor(view))
    }
    this.view = view

    this.pins.update(state)
    this.updateAttribution()
    this.updateCursor()
  }

  public dispose() {
    this.pins.dispose()
    this.map.remove()
  }

  // #region Zoom

  private toMapZoom(zoom: number) {
    return scaleZoom(zoom, this.state.size.width, this.state.displaySize.width)
  }

  private fromMapZoom(mapZoom: number) {
    return scaleZoom(mapZoom, this.state.displaySize.width, this.state.size.width)
  }

  private get minZoom() {
    return Math.max(MIN_MAP_ZOOM, this.toMapZoom(0))
  }

  private get maxZoom() {
    return Math.min(MAX_MAP_ZOOM, this.toMapZoom(MAX_ZOOM))
  }

  private cameraFor(view: MapViewport) {
    return {center: [view.center.lng, view.center.lat] as [number, number], zoom: this.toMapZoom(view.zoom)}
  }

  // #endregion

  // #region Interaction

  private get style() {
    return styleOf(this.state)
  }

  private get paint(): RasterPaint {
    const {grayscale, map_opacity} = MapProps.resolve(this.state.values)
    return {grayscale, opacity: map_opacity}
  }

  private get selectedIndex() {
    return listIndex(this.state.selection, 'markers')
  }

  private get canPlaceSelected() {
    const index = this.selectedIndex
    return index != null && !this.state.isLocked(widgetPath('markers', index, 'location'))
  }

  private updateAttribution() {
    const shown = this.map.hasControl(this.attribution)
    const {attribution} = MapProps.resolve(this.state.values)
    if (attribution && !shown) {
      this.map.addControl(this.attribution)
    } else if (!attribution && shown) {
      this.map.removeControl(this.attribution)
    }
  }

  private updateCursor() {
    this.map.getCanvasContainer().style.cursor = this.canPlaceSelected ? 'crosshair' : ''
  }

  // Only user gestures carry an original event; resizes and programmatic moves don't.
  private handleMoveStart = (event: {originalEvent?: unknown}) => {
    if (event.originalEvent != null) { this.userMoving = true }
  }

  private handleMoveEnd = () => {
    if (!this.userMoving) { return }
    this.userMoving = false

    const center = this.map.getCenter().wrap()
    this.view = new MapViewport(roundPoint({lat: center.lat, lng: center.lng}), roundZoom(this.fromMapZoom(this.map.getZoom())))
    this.context.edit({
      changes: [
        {path: 'center', value: this.view.center},
        {path: 'zoom', value: this.view.zoom},
        {path: 'bounds', value: null},
      ],
    })
  }

  private handleClick = (event: MapMouseEvent) => {
    if (isOnPin(event)) { return }

    const index = this.selectedIndex
    if (index == null || !this.canPlaceSelected) { return }

    const {lat, lng} = event.lngLat.wrap()
    this.context.edit({
      changes: [{path: widgetPath('markers', index, 'location'), value: roundPoint({lat, lng})}],
    })
  }

  // Pins center on themselves.
  private handleDoubleClick = (event: MapMouseEvent) => {
    if (isOnPin(event) || isViewLocked(this.state)) { return }

    const {lat, lng} = event.lngLat.wrap()
    this.context.edit({changes: centerOn(this.state, roundPoint({lat, lng}))})
  }

  // #endregion

}

// Clicks on the pins bubble up to the map too.
function isOnPin(event: MapMouseEvent) {
  const {target} = event.originalEvent
  return target instanceof Element && target.closest('.maplibregl-marker') != null
}

function styleOf(state: WidgetContentState) {
  return typeof state.values.map_style === 'string' ? state.values.map_style : ''
}

function disableNavigation(map: MapLibreMap) {
  map.dragPan.disable()
  map.scrollZoom.disable()
  map.boxZoom.disable()
  map.keyboard.disable()
  map.touchZoomRotate.disable()
}

const MIN_MAP_ZOOM = -2
const MAX_MAP_ZOOM = 24
