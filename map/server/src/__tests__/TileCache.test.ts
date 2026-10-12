import { describe, expect, it, vi } from 'vitest'
import { TileCache } from '../TileCache'

describe("TileCache", () => {

  it("should fetch each key once", async () => {
    const cache = new TileCache<string>(10)
    const fetch = vi.fn(async () => 'tile')

    expect(await cache.get('a', fetch)).toEqual('tile')
    expect(await cache.get('a', fetch)).toEqual('tile')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("should share fetches in flight", async () => {
    const cache = new TileCache<string>(10)
    const fetch = vi.fn(async () => 'tile')

    await Promise.all([cache.get('a', fetch), cache.get('a', fetch)])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("should evict the least recently used", async () => {
    const cache = new TileCache<string>(2)
    const fetch = vi.fn(async () => 'tile')

    await cache.get('a', fetch)
    await cache.get('b', fetch)
    await cache.get('a', fetch)
    await cache.get('c', fetch)
    expect(fetch).toHaveBeenCalledTimes(3)

    await cache.get('a', fetch)
    expect(fetch).toHaveBeenCalledTimes(3)
    await cache.get('b', fetch)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it("should not keep failures", async () => {
    const cache = new TileCache<string>(10)
    await expect(cache.get('a', async () => { throw new Error("Nope") })).rejects.toThrow("Nope")
    expect(await cache.get('a', async () => 'tile')).toEqual('tile')
  })

})
