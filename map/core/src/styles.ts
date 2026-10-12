// MapTiler map styles that are offered as raster tiles.
export const mapStyles: MapStyle[] = [
  {id: 'streets-v2', label: 'Streets', format: 'png'},
  {id: 'basic-v2', label: 'Basic', format: 'png'},
  {id: 'bright-v2', label: 'Bright', format: 'png'},
  {id: 'outdoor-v2', label: 'Outdoor', format: 'png'},
  {id: 'topo-v2', label: 'Topo', format: 'png'},
  {id: 'dataviz', label: 'Dataviz', format: 'png'},
  {id: 'backdrop', label: 'Backdrop', format: 'png'},
  {id: 'toner-v2', label: 'Toner', format: 'png'},
  {id: 'winter-v2', label: 'Winter', format: 'png'},
  {id: 'satellite', label: 'Satellite', format: 'jpg'},
  {id: 'hybrid', label: 'Hybrid', format: 'jpg'},
]

export function mapStyle(id: string): MapStyle | null {
  return mapStyles.find(it => it.id === id) ?? null
}

export interface MapStyle {
  id:     string
  label:  string
  format: 'png' | 'jpg'
}
