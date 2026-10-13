import { param, resolveParams, WidgetProps } from '@randall/plugin-sdk'
import { GeoPoint } from './geo'
import { shapeNames, shapes, shapeViewBox } from './marker/shapes'

export const markerParams = {
  location: param.custom({label: 'Location', schema: GeoPoint.paramSchema.nullable(), default: null}),

  // The name of a shape from `shapes`, drawn inside the pin.
  icon: param.choice({
    label:   'Icon',
    grid:    true,
    choices: shapeNames.map(it => ({value: it, label: it, glyph: {path: shapes[it], viewBox: shapeViewBox}})),
    default: null,
  }),

  color: param.color({label: 'Color', default: '#E53935'}),
  size:  param.number({label: 'Size', min: 0, default: 48}),
}

export type MapMarker = WidgetProps<typeof markerParams>

export namespace MapMarker {

  export function create(location: GeoPoint | null, overrides: Partial<MapMarker> = {}): MapMarker {
    return {...resolve({}), location, ...overrides}
  }

  export function resolve(raw: Record<string, unknown>): MapMarker {
    return resolveParams(markerParams, raw)
  }

}
