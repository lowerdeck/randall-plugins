import { WidgetAnimation } from '@randall/plugin-sdk'
import { MapProps } from '../MapProps'

export function flightAnimations(props: MapProps): WidgetAnimation[] {
  return MapProps.flies(props) ? [flightAnimation] : []
}

export const flightAnimation: WidgetAnimation = {
  name:            'flight',
  label:           'animations.flight',
  defaultDuration: 3,
}
