import { Size } from 'ytil'

export interface WidgetDrawContext<R> {
  size:      Size
  frame:     number
  fps:       number
  resources: R

  /** Creates a path from SVG path data. Not every canvas implementation has a global `Path2D`. */
  createPath(data?: string): Path2D
}
