import { markerIconBox } from './marker'
import { shapeViewBox } from './shapes'

// Places an icon shape in the pin head, in pin view box units: fitted into the icon box.
export function markerGlyphTransform(): MarkerGlyphTransform {
  const {cx, cy, size} = markerIconBox

  return {
    x:     cx - size / 2,
    y:     cy - size / 2,
    scale: size / shapeViewBox,
  }
}

export interface MarkerGlyphTransform {
  x:     number
  y:     number
  scale: number
}
