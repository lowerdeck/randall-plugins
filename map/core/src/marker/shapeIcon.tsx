import { ReactNode } from 'react'
import { ShapeName, shapes, shapeViewBox } from './shapes'

// A shape as an icon, for choosing it in the editor.
export function shapeIcon(name: ShapeName): ReactNode {
  return (
    <svg viewBox={`0 0 ${shapeViewBox} ${shapeViewBox}`} width='1em' height='1em' fill='currentColor'>
      <path d={shapes[name]}/>
    </svg>
  )
}
