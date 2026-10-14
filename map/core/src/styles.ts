// MapTiler map styles that are offered as raster tiles.
export const mapStyles: MapStyle[] = [
  {id: 'streets-v2', format: 'png'},
  {id: 'basic-v2', format: 'png'},
  {id: 'bright-v2', format: 'png'},
  {id: 'outdoor-v2', format: 'png'},
  {id: 'topo-v2', format: 'png'},
  {id: 'dataviz', format: 'png'},
  {id: 'backdrop', format: 'png'},
  {id: 'toner-v2', format: 'png'},
  {id: 'winter-v2', format: 'png'},
  {id: 'satellite', format: 'jpg', labeled: 'hybrid'},
]

export function mapStyle(id: string): MapStyle | null {
  return [...mapStyles, ...labeledStyles].find(it => it.id === id) ?? null
}

/** Whether labels can be turned on or off for the style: raster tiles have them baked in, if at all. */
export function hasLabelToggle(style: string): boolean {
  return mapStyle(style)?.labeled != null
}

/** The style to load tiles of. */
export function tileStyle(style: string, labels: boolean): string {
  return labels ? mapStyle(style)?.labeled ?? style : style
}

export interface MapStyle {
  id:     string
  format: 'png' | 'jpg'

  /** The same style with labels, if it has none of its own. */
  labeled?: string
}

// Only offered through the label toggle of the style without.
const labeledStyles: MapStyle[] = [
  {id: 'hybrid', format: 'jpg'},
]
