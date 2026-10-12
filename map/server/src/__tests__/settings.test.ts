import { WidgetSettingsError } from '@randall/widget-sdk-server'
import { describe, expect, it } from 'vitest'
import { MapSettings, mapSettingsHandler, maptilerAPIKey } from '../settings'
import { fakeSecrets } from './fakeSecrets'

describe("mapSettingsHandler", () => {

  const none: MapSettings = {provider: 'none'}

  function maptiler() {
    return mapSettingsHandler.update(none, {provider: 'maptiler', api_key: 'mt-secret1234'}, fakeSecrets)
  }

  it("should encrypt a new key", () => {
    expect(maptiler()).toEqual({provider: 'maptiler', api_key: 'enc:mt-secret1234'})
    expect(maptilerAPIKey(maptiler(), fakeSecrets)).toEqual('mt-secret1234')
  })

  it("should keep the stored key when it is left out or sent back masked", () => {
    const current = maptiler()
    expect(mapSettingsHandler.update(current, {provider: 'maptiler'}, fakeSecrets)).toBe(current)
    expect(mapSettingsHandler.update(current, mapSettingsHandler.publicView(current, fakeSecrets), fakeSecrets)).toBe(current)
  })

  it("should require a key when enabling MapTiler", () => {
    expect(() => mapSettingsHandler.update(none, {provider: 'maptiler'}, fakeSecrets)).toThrow(WidgetSettingsError)
  })

  it("should reject invalid updates", () => {
    expect(() => mapSettingsHandler.update(none, {provider: 'google'}, fakeSecrets)).toThrow(WidgetSettingsError)
  })

  it("should disable maps", () => {
    expect(mapSettingsHandler.update(maptiler(), {provider: 'none'}, fakeSecrets)).toEqual(none)
    expect(maptilerAPIKey(none, fakeSecrets)).toBeNull()
  })

  it("should only show the last characters of the key", () => {
    expect(mapSettingsHandler.publicView(maptiler(), fakeSecrets)).toEqual({provider: 'maptiler', api_key: '••••1234'})
    expect(mapSettingsHandler.publicView(none, fakeSecrets)).toEqual(none)
  })

})
