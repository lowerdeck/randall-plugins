// Shapes that can be drawn in a marker's pin head, referred to by name. Each spans a square of `shapeViewBox` units.
export const shapes = {
  'circle':   'M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2Z',
  'square':   'M3 3H21V21H3Z',
  'diamond':  'M12 1L23 12L12 23L1 12Z',
  'triangle': 'M12 2L23 21H1Z',
  'pentagon': 'M12 1.5L22.46 9.1L18.47 21.4L5.53 21.4L1.54 9.1Z',
  'hexagon':  'M12 1L21.53 6.5L21.53 17.5L12 23L2.47 17.5L2.47 6.5Z',
  'star':     'M12 1.2L14.7 8.98L22.94 9.15L16.37 14.12L18.76 22L12 17.3L5.24 22L7.63 14.12L1.06 9.15L9.3 8.98Z',
  'heart':    'M12 21C7 17 2 13.5 2 8.5C2 5.5 4.5 3 7.5 3C9.5 3 11 4 12 5.5C13 4 14.5 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 17 17 12 21Z',
  'plus':     'M9 2H15V9H22V15H15V22H9V15H2V9H9Z',
  'cross':    'M16.95 2.81L21.19 7.05L16.24 12L21.19 16.95L16.95 21.19L12 16.24L7.05 21.19L2.81 16.95L7.76 12L2.81 7.05L7.05 2.81L12 7.76Z',
} satisfies Record<string, string>

export type ShapeName = keyof typeof shapes
export const shapeNames = Object.keys(shapes) as ShapeName[]
export const shapeViewBox = 24

export function isShapeName(name: unknown): name is ShapeName {
  return typeof name === 'string' && Object.hasOwn(shapes, name)
}
