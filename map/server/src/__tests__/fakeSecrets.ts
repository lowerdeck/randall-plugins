import { WidgetSecrets } from '@randall/widget-sdk-server'

export const fakeSecrets: WidgetSecrets = {
  encrypt:  value => `enc:${value}`,
  decrypt:  value => value.replace(/^enc:/, ''),
  mask:     value => `••••${value.slice(-4)}`,
  isMasked: value => value.startsWith('••••'),
}
