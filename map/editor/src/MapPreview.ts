import {
  formatLocation,
  MapProps,
  MapViewport,
  MAX_ZOOM,
  scaleZoom,
  tileStyle,
} from '@randall-plugins/map'
import {
  listIndex,
  widgetPath,
  WidgetChange,
  WidgetPreview,
  WidgetPreviewContext,
  WidgetPreviewState,
} from '@randall/plugin-sdk-editor'
import {
  AttributionControl,
  Map as MapLibreMap,
  MapMouseEvent,
  NavigationControl,
  RasterTileSource,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapLocator } from './MapLocator'
import { MapPins } from './MapPins'
import {
  cameraView,
  centerOn,
  isCenterLocked,
  isZoomLocked,
  panTo,
  roundPoint,
  roundZoom,
  sameView,
} from './mapView'
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
export class MapPreview implements WidgetPreview {

  constructor(
    container: HTMLElement,
    private readonly context: WidgetPreviewContext,
    private state: WidgetPreviewState,
  ) {
    this.view = cameraView(state)
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
    this.map.boxZoom.disable()
    this.map.keyboard.disable()
    this.updateNavigation()

    this.map.on('movestart', this.handleMoveStart)
    this.map.on('moveend', this.handleMoveEnd)
    this.map.on('click', this.handleClick)
    this.map.on('dblclick', this.handleDoubleClick)

    this.pins = new MapPins(this.map, context)
    this.pins.update(state)
    this.updateAttribution()
    this.updateCursor()

    // Shows locations that had to be looked up once they're known.
    this.locator = new MapLocator(context.host, () => this.update(this.state))
    this.locator.update(state)
  }

  private readonly map: MapLibreMap
  private readonly attribution = new AttributionControl({compact: true})

  // Its buttons pass on their click events, so their zooms count as user gestures, and are kept.
  private readonly navigation = new NavigationControl({showCompass: false})
  private navigationState: {around: boolean, zoom: boolean} | null = null
  private readonly pins: MapPins
  private readonly locator: MapLocator

  private view: MapViewport

  private userMoving = false

  public update(state: WidgetPreviewState) {
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

    const view = cameraView(state)
    if (resized) {
      this.map.jumpTo(this.cameraFor(view))
    } else if (!sameView(view, this.view)) {
      this.map.easeTo(this.cameraFor(view))
    }
    this.view = view

    this.pins.update(state)
    this.locator.update(state)
    this.updateNavigation()
    this.updateAttribution()
    this.updateCursor()
  }

  public dispose() {
    this.locator.dispose()
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

  // A bound center can still be panned, to look around, but zooms around the center.
  private updateNavigation() {
    const zoom = !isZoomLocked(this.state)
    const around = isCenterLocked(this.state)
    if (this.navigationState?.around === around && this.navigationState.zoom === zoom) { return }
    this.navigationState = {around, zoom}

    const options = around ? {around: 'center' as const} : undefined

    // Enabling again doesn't change the options, so they're disabled first.
    this.map.scrollZoom.disable()
    this.map.touchZoomRotate.disable()
    if (zoom) {
      this.map.scrollZoom.enable(options)
      this.map.touchZoomRotate.enable(options)
      this.map.touchZoomRotate.disableRotation()
    }

    const shown = this.map.hasControl(this.navigation)
    if (zoom && !shown) {
      this.map.addControl(this.navigation, 'top-right')
    } else if (!zoom && shown) {
      this.map.removeControl(this.navigation)
    }
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

    const {lat, lng} = this.map.getCenter().wrap()
    this.view = new MapViewport(roundPoint({lat, lng}), roundZoom(this.fromMapZoom(this.map.getZoom())))

    // Panning a bound center only looks around.
    const centerLocked = isCenterLocked(this.state)
    const changes: WidgetChange[] = []
    if (!centerLocked) { changes.push({path: 'center', value: formatLocation(this.view.center)}) }
    if (!isZoomLocked(this.state)) { changes.push({path: 'zoom', value: this.view.zoom}) }

    const pan = centerLocked ? panTo(this.state, this.view.center) : {}
    this.context.edit({...pan, changes})
  }

  private handleClick = (event: MapMouseEvent) => {
    if (isOnPin(event)) { return }

    const index = this.selectedIndex
    if (index == null || !this.canPlaceSelected) { return }

    const {lat, lng} = event.lngLat.wrap()
    this.context.edit({
      changes: [{path: widgetPath('markers', index, 'location'), value: formatLocation({lat, lng})}],
    })
  }

  // Pins center on themselves.
  private handleDoubleClick = (event: MapMouseEvent) => {
    if (isOnPin(event)) { return }

    const {lat, lng} = event.lngLat.wrap()
    this.context.edit(centerOn(this.state, roundPoint({lat, lng})))
  }

  // #endregion

}

// Clicks on the pins bubble up to the map too.
function isOnPin(event: MapMouseEvent) {
  const {target} = event.originalEvent
  return target instanceof Element && target.closest('.maplibregl-marker') != null
}

function styleOf(state: WidgetPreviewState) {
  const {map_style, labels} = MapProps.resolve(state.values)
  return tileStyle(map_style, labels)
}

const MIN_MAP_ZOOM = -2
const MAX_MAP_ZOOM = 24
