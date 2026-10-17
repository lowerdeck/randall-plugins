import { Size } from 'ytil'
import { WidgetAnimationFrames } from './WidgetAnimation'

export interface WidgetDrawContext<R> {
  size:      Size
  frame:     number
  fps:       number
  resources: R

  /** The frames of the animations, see `widgetAnimationFrames`. */
  animations: WidgetAnimationFrames

  /** Creates a path from SVG path data. Not every canvas implementation has a global `Path2D`. */
  createPath(data?: string): Path2D
}
