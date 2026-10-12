import { WidgetSecrets } from './WidgetSecrets'

export interface WidgetServerContext<S> {
  organisationId: number
  settings:       S
  secrets:        WidgetSecrets
}
