import { WidgetServerContext } from '@randall/plugin-sdk-server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { geocodeParamResolver } from '../geocode.param-resolver'
import { MapSettings } from '../settings'
import { fakeSecrets } from './fakeSecrets'

describe("geocodeParamResolver", () => {

  const context: WidgetServerContext<MapSettings> = {
    organisationId: 1,
    settings:       {provider: 'maptiler', api_key: fakeSecrets.encrypt('key')},
    secrets:        fakeSecrets,
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("should fill in the location of the first result", async () => {
    vi.stubGlobal('fetch', async () => Response.json({
      features: [
        {place_name: 'Dam, Amsterdam', center: [4.8926123456, 52.3731654321]},
        {place_name: 'Dam, Elsewhere', center: [1, 2]},
      ],
    }))

    const values = await geocodeParamResolver.resolve('Dam 1, Amsterdam', {location_param: 'location'}, context)
    expect(values).toEqual({location: '52.373165, 4.892612'})
  })

  it("should fill in the name of the place, looked up from the location", async () => {
    const fetch = vi.fn(async () => Response.json({
      features: [{place_name: 'Damrak 1, Amsterdam', center: [4.8936, 52.3741]}],
    }))
    vi.stubGlobal('fetch', fetch)

    const values = await geocodeParamResolver.resolve('52.3741, 4.8936', {name_param: 'name'}, context)
    expect(values).toEqual({name: 'Damrak 1, Amsterdam'})
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(`${fetch.mock.calls[0]}`).toContain('/geocoding/4.8936,52.3741.json')
  })

  it("should fill in nothing without output params", async () => {
    const fetch = vi.fn(async () => Response.json({features: []}))
    vi.stubGlobal('fetch', fetch)

    expect(await geocodeParamResolver.resolve('Somewhere', {}, context)).toEqual({})
    expect(fetch).not.toHaveBeenCalled()
  })

  it("should fill in nothing without a value or a result", async () => {
    const fetch = vi.fn(async () => Response.json({features: []}))
    vi.stubGlobal('fetch', fetch)

    expect(await geocodeParamResolver.resolve(' ', {location_param: 'location'}, context)).toEqual({})
    expect(await geocodeParamResolver.resolve(null, {location_param: 'location'}, context)).toEqual({})
    expect(fetch).not.toHaveBeenCalled()

    expect(await geocodeParamResolver.resolve('Nowhere at all', {location_param: 'location'}, context)).toEqual({})
  })

})
