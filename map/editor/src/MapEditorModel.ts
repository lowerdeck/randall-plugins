import { isEqual } from 'lodash'
import { LngLatLike, Map as MapLibreMap } from 'maplibre-gl'
import { action, computed, makeObservable, observable } from 'mobx'
import { MapMarker, MapProps, MAX_ZOOM, scaleZoom } from '@randall-widgets/map'
import { WidgetSize } from '@randall/widget-sdk'
import { WidgetEditorHost } from '@randall/widget-sdk-editor'
import { Attribute, GeoPoint } from 'templates'
import { GeocodeResult } from './GeocodeResult'
import { MapMarkerItem } from './MapMarkerItem'

// Edits the view, style and markers of a map widget. The view is kept in widget zoom units, and converted to
// and from the zoom of the (differently sized) interactive map, so that both show the same extent.
export class MapEditorModel {

  constructor(
    rawProps: Record<string, unknown>,
    evaluatedProps: Record<string, unknown>,
    widgetSize: WidgetSize,
    public readonly host: WidgetEditorHost,
  ) {
    this.rawProps = rawProps as Record<string, Attribute<unknown>>
    this.props = MapProps.resolve(evaluatedProps)
    this._widgetSize = widgetSize

    const viewport = MapProps.viewport(this.props, this.widgetSize)
    this._center = viewport.center
    this._zoom = viewport.zoom
    this._style = this.props.map_style
    this._markers = buildItems(this.rawProps.markers, evaluatedProps.markers)
    this.initialMarkers = this._markers
    this._selectedIndex = this._markers.length > 0 ? 0 : null

    makeObservable(this)
  }

  private readonly rawProps: Record<string, Attribute<unknown>>

  /** The evaluated props at the time of opening. */
  public readonly props: MapProps

  // The view is kept as it is when the size changes, so the map shows more or less of the area around its center.
  @observable.ref
  private accessor _widgetSize: WidgetSize
  public get widgetSize() { return this._widgetSize }

  @action
  public setWidgetSize(size: WidgetSize) {
    this._widgetSize = size
  }

  private readonly initialMarkers: MapMarkerItem[]
  private map: MapLibreMap | null = null

  // #region Locks

  public get markersLocked() {
    return Attribute.isDynamic(this.rawProps.markers)
  }

  public get styleLocked() {
    return Attribute.isDynamic(this.rawProps.map_style)
  }

  // Bounds take precedence over center and zoom, so a bound bounds prop can't be overridden here either.
  public get viewLocked() {
    return ['center', 'zoom', 'bounds'].some(it => Attribute.isDynamic(this.rawProps[it]))
  }

  public get canMoveSelectedMarker() {
    return this._selectedIndex != null && !this.isMarkerFieldLocked(this._selectedIndex, 'location')
  }

  public isMarkerFieldLocked(index: number, field: keyof MapMarker) {
    const item = this._markers[index]
    return this.markersLocked || item == null || MapMarkerItem.isLocked(item, field)
  }

  // #endregion

  // #region View & style

  @observable
  private accessor _center: GeoPoint
  public get center() { return this._center }

  @observable
  private accessor _zoom: number
  public get zoom() { return this._zoom }

  @observable
  private accessor _viewChanged: boolean = false
  public get viewChanged() { return this._viewChanged }

  @observable
  private accessor _style: string
  public get style() { return this._style }

  @computed
  public get styleChanged() {
    return !this.styleLocked && this._style !== this.props.map_style
  }

  @action
  public updateView(center: GeoPoint, mapZoom: number, mapWidth: number) {
    this._center = center
    this._zoom = this.fromMapZoom(mapZoom, mapWidth)
  }

  @action
  public markViewChanged() {
    if (this.viewLocked) { return }
    this._viewChanged = true
  }

  @action
  public setStyle(style: string) {
    if (this.styleLocked) { return }
    this._style = style
  }

  // #endregion

  // #region Markers

  @observable.ref
  private accessor _markers: MapMarkerItem[]
  public get markers() { return this._markers }

  @observable
  private accessor _selectedIndex: number | null
  public get selectedIndex() { return this._selectedIndex }

  public get selectedMarker() {
    return this._selectedIndex == null ? null : this._markers[this._selectedIndex] ?? null
  }

  @computed
  public get markersChanged() {
    return !this.markersLocked && !isEqual(this.markersSpec, this.initialMarkersSpec)
  }

  @computed
  private get markersSpec() {
    return this._markers.map(MapMarkerItem.toSpec)
  }

  @computed
  private get initialMarkersSpec() {
    return this.initialMarkers.map(MapMarkerItem.toSpec)
  }

  @action
  public selectMarker(index: number | null) {
    this._selectedIndex = index
  }

  @action
  public updateMarker<K extends keyof MapMarker>(index: number, field: K, value: MapMarker[K]) {
    if (this.isMarkerFieldLocked(index, field)) { return }
    this._markers = this._markers.map((it, i) => i === index ? MapMarkerItem.update(it, field, value) : it)
  }

  @action
  public updateSelectedMarker<K extends keyof MapMarker>(field: K, value: MapMarker[K]) {
    if (this._selectedIndex == null) { return }
    this.updateMarker(this._selectedIndex, field, value)
  }

  @action
  public setMarkerLocation(index: number, location: GeoPoint) {
    this.updateMarker(index, 'location', roundPoint(location))
  }

  @action
  public moveSelectedMarker(location: GeoPoint) {
    if (this._selectedIndex == null) { return }
    this.setMarkerLocation(this._selectedIndex, location)
  }

  @action
  public addMarker(location: GeoPoint = this._center) {
    if (this.markersLocked) { return }
    this._markers = [...this._markers, MapMarkerItem.create(roundPoint(location))]
    this._selectedIndex = this._markers.length - 1
  }

  @action
  public removeSelectedMarker() {
    const index = this._selectedIndex
    if (index == null || this.markersLocked) { return }

    this._markers = this._markers.filter((_, i) => i !== index)
    this._selectedIndex = this._markers.length === 0 ? null : Math.min(index, this._markers.length - 1)
  }

  // #endregion

  @computed
  public get modified() {
    return Object.keys(this.updates).length > 0
  }

  // #region Zoom & pin size

  public toMapZoom(zoom: number, mapWidth: number) {
    return scaleZoom(zoom, this.widgetSize.width, mapWidth)
  }

  public fromMapZoom(mapZoom: number, mapWidth: number) {
    return scaleZoom(mapZoom, mapWidth, this.widgetSize.width)
  }

  // Kept grabbable, even if the actual marker is tiny or hidden.
  public pinHeight(item: MapMarkerItem, mapWidth: number) {
    return Math.max(MIN_PIN_HEIGHT, item.marker.size * mapWidth / this.widgetSize.width)
  }

  // #endregion

  // #region Map interaction

  public attachMap(map: MapLibreMap) {
    this.map = map
  }

  public detachMap(map: MapLibreMap) {
    if (this.map !== map) { return }
    this.map = null
  }

  public centerOnSelectedMarker() {
    const location = this.selectedMarker?.location
    if (this.map == null || location == null || this.viewLocked) { return }

    this.markViewChanged()
    this.map.easeTo({center: toLngLat(location)})
  }

  @action
  public showSearchResult(result: GeocodeResult) {
    if (this._markers.length === 0) {
      this.addMarker(result.center)
    } else {
      this.moveSelectedMarker(result.center)
    }
    if (this.map == null || this.viewLocked) { return }

    this.markViewChanged()

    const mapWidth = this.map.getContainer().clientWidth
    if (result.bounds != null) {
      const {west, south, east, north} = result.bounds
      const padding = this.props.bounds_padding * mapWidth / this.widgetSize.width
      this.map.fitBounds([[west, south], [east, north]], {padding})
    } else {
      this.map.flyTo({center: toLngLat(result.center), zoom: this.toMapZoom(SEARCH_RESULT_ZOOM, mapWidth)})
    }
  }

  // #endregion

  // #region Saving

  @computed
  public get updates(): Record<string, unknown> {
    const updates: Record<string, unknown> = {}

    // Without a center, the map follows the first marker, which is not what the user saw while moving it.
    const firstMoved = !isEqual(firstLocation(this._markers), firstLocation(this.initialMarkers))
    const writeView = !this.viewLocked && (this._viewChanged || (firstMoved && this.rawProps.center == null))
    if (writeView) {
      updates.center = roundPoint(this._center)
      updates.zoom = Math.round(Math.max(0, Math.min(MAX_ZOOM, this._zoom)) * 100) / 100
    }
    if (!this.viewLocked && this._viewChanged) {
      updates.bounds = null
    }
    if (this.markersChanged) {
      updates.markers = this.markersSpec
    }
    if (this.styleChanged) {
      updates.map_style = this._style
    }

    return updates
  }
  // #endregion

}

// Raw and evaluated entries correspond by index. Null entries are dropped, as rendering ignores them anyway.
function buildItems(raw: unknown, evaluated: unknown): MapMarkerItem[] {
  const evaluatedEntries = Array.isArray(evaluated) ? evaluated : []
  const rawEntries = Array.isArray(raw) ? raw : evaluatedEntries

  const items: MapMarkerItem[] = []
  rawEntries.forEach((entry, index) => {
    if (entry == null) { return }
    items.push(MapMarkerItem.fromSpec(entry, evaluatedEntries[index]))
  })
  return items
}

function firstLocation(items: MapMarkerItem[]) {
  return items.find(it => it.location != null)?.location ?? null
}

function toLngLat(point: GeoPoint): LngLatLike {
  return [point.lng, point.lat]
}

// About 10 cm, more than enough.
function roundPoint(point: GeoPoint): GeoPoint {
  return {
    lat: Math.round(point.lat * 1e6) / 1e6,
    lng: Math.round(point.lng * 1e6) / 1e6,
  }
}

const MIN_PIN_HEIGHT = 24
const SEARCH_RESULT_ZOOM = 14
