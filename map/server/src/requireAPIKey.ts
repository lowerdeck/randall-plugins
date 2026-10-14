import { WidgetRequestError, WidgetServerContext } from '@randall/plugin-sdk-server'
import { MapSettings, maptilerAPIKey } from './settings'

export function requireAPIKey(context: WidgetServerContext<MapSettings>): string {
  const key = maptilerAPIKey(context.settings, context.secrets)
  if (key == null) {
    throw new WidgetRequestError(503, "Maps are not configured for this organisation")
  }
  return key
}
