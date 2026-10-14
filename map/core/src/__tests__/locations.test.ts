import { describe, expect, it, vi } from 'vitest'
import { locateAll } from '../locations'

describe("locateAll", () => {

  function host(results: Record<string, {lat: number, lng: number} | null>) {
    return {
      query: vi.fn(async (_name: string, {query}: Record<string, string>) => {
        const center = results[query.toLowerCase()]
        return (center == null ? [] : [{label: query, center, bounds: null}]) as any
      }),
    }
  }

  it("takes \"lat, lng\" as it is, and geocodes anything else to its first result", async () => {
    const amsterdam = {lat: 52.37, lng: 4.89}
    const geocoder = host({'test amsterdam': amsterdam})

    const locate = await locateAll(['52, 4', 'Test Amsterdam', ''], geocoder, error => { throw error })
    expect(locate('52, 4')).toEqual({lat: 52, lng: 4})
    expect(locate('Test Amsterdam')).toEqual(amsterdam)
    expect(locate('')).toBeNull()
  })

  it("geocodes the same text only once", async () => {
    const geocoder = host({'test rotterdam': {lat: 51.92, lng: 4.48}})

    await locateAll(['Test Rotterdam', 'test rotterdam ', 'Test Rotterdam'], geocoder, error => { throw error })
    await locateAll(['Test Rotterdam'], geocoder, error => { throw error })
    expect(geocoder.query).toHaveBeenCalledTimes(1)
  })

  it("reports failures, and leaves those texts without a location", async () => {
    const errors: unknown[] = []
    const failing = {query: vi.fn(async () => { throw new Error("offline") })}

    const locate = await locateAll(['Test Utrecht'], failing, error => errors.push(error))
    expect(errors).toHaveLength(1)
    expect(locate('Test Utrecht')).toBeNull()
  })

})
