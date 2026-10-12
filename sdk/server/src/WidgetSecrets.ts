/**
 * Keeps secrets in widget settings secret: they're stored encrypted, and only shown masked.
 */
export interface WidgetSecrets {
  encrypt(value: string): string
  decrypt(value: string): string

  mask(value: string): string
  isMasked(value: string): boolean
}
