import { WidgetRequestError, WidgetServerContext } from '@randall/plugin-sdk-server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mapServerPlugin } from '../map.server-plugin'
import { MapSettings } from '../settings'
import { fakeSecrets } from './fakeSecrets'

describe("mapServerPlugin", () => {

  function context(apiKey?: string): WidgetServerContext<MapSettings> {
    return {
      organisationId: 1,
      settings:       apiKey == null ? {provider: 'none'} : {provider: 'maptiler', api_key: fakeSecrets.encrypt(apiKey)},
      secrets:        fakeSecrets,
    }
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("should only be enabled with a provider", () => {
    expect(mapServerPlugin.widget.settings!.isEnabled(context('key').settings)).toBe(true)
    expect(mapServerPlugin.widget.settings!.isEnabled(context().settings)).toBe(false)
  })

  describe("tiles", () => {

    it("should fetch the tile with the organisation's key", async () => {
      const fetch = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), {headers: {'Content-Type': 'image/png'}}))
      vi.stubGlobal('fetch', fetch)

      const tile = await mapServerPlugin.resource!('tiles/bright-v2/2/1/3', context('org-key'))
      expect(fetch).toHaveBeenCalledWith('https://api.maptiler.com/maps/bright-v2/2/1/3.png?key=org-key')
      expect(tile.mimeType).toEqual('image/png')
      expect([...tile.data]).toEqual([1, 2, 3])
    })

    it("should reject unknown resources, styles and tiles out of range", async () => {
      await expect(mapServerPlugin.resource!('nope', context('key'))).rejects.toMatchObject({status: 404})
      await expect(mapServerPlugin.resource!('tiles/nope/0/0/0', context('key'))).rejects.toMatchObject({status: 400})
      await expect(mapServerPlugin.resource!('tiles/streets-v2/2/4/0', context('key'))).rejects.toMatchObject({status: 400})
    })

    it("should fail when maps are not configured", async () => {
      await expect(mapServerPlugin.resource!('tiles/streets-v2/0/0/0', context())).rejects.toThrow(WidgetRequestError)
    })

    it("should map upstream errors", async () => {
      vi.stubGlobal('fetch', async () => new Response(null, {status: 403}))
      await expect(mapServerPlugin.resource!('tiles/topo-v2/1/0/0', context('key'))).rejects.toMatchObject({status: 502})
    })

  })

  describe("geocode", () => {

    it("should return places", async () => {
      const fetch = vi.fn(async () => Response.json({
        features: [
          {place_name: 'Amsterdam, Netherlands', center: [4.89, 52.37], bbox: [4.73, 52.28, 5.07, 52.43]},
          {place_name: 'Amsterdam, New York', center: [-74.19, 42.94]},
        ],
      }))
      vi.stubGlobal('fetch', fetch)

      expect(await mapServerPlugin.query!('geocode', {query: 'amsterdam'}, context('org-key'))).toEqual([
        {label: 'Amsterdam, Netherlands', center: {lat: 52.37, lng: 4.89}, bounds: {west: 4.73, south: 52.28, east: 5.07, north: 52.43}},
        {label: 'Amsterdam, New York', center: {lat: 42.94, lng: -74.19}, bounds: null},
      ])
      expect(`${fetch.mock.calls[0]}`).toContain('/geocoding/amsterdam.json?key=org-key')
    })

    it("should reject empty queries and unknown query names", async () => {
      await expect(mapServerPlugin.query!('geocode', {query: ' '}, context('key'))).rejects.toMatchObject({status: 400})
      await expect(mapServerPlugin.query!('nope', {}, context('key'))).rejects.toMatchObject({status: 404})
    })

  })

})
