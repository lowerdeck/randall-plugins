import { ChoiceFieldVariant, namedParams, param, resolveParams, WidgetProps } from '@randall/plugin-sdk'
import { GeoPoint } from './geo'
import { shapeIcon } from './marker/shapeIcon'
import { shapeNames } from './marker/shapes'

export const markerParams = [
  param.custom('location', {schema: GeoPoint.paramSchema.nullable(), default: null}),

  // The name of a shape from `shapes`, drawn inside the pin.
  param.choice('icon', {
    variant: ChoiceFieldVariant.Grid,
    choices: shapeNames.map(it => ({value: it, label: `shapes.${it}`, render: () => shapeIcon(it)})),
    default: null,
  }),

  param.color('color', {default: '#E53935'}),
  param.number('size', {min: 0, default: 48}),
]

const markerParamsByName = namedParams(markerParams)

export type MapMarker = WidgetProps<typeof markerParamsByName>

export namespace MapMarker {

  export function create(location: GeoPoint | null, overrides: Partial<MapMarker> = {}): MapMarker {
    return {...resolve({}), location, ...overrides}
  }

  export function resolve(raw: Record<string, unknown>): MapMarker {
    return resolveParams(markerParamsByName, raw)
  }

}
