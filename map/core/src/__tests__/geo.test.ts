import { describe, expect, it } from 'vitest'
import { MapViewport, project, unproject, visibleTiles } from '../geo'
import { locateCached } from '../locations'
import { MapProps } from '../MapProps'

describe("mercator", () => {

  it("projects the origin to the world center", () => {
    expect(project({lat: 0, lng: 0})).toEqual([0.5, 0.5])
  })

  it("round-trips", () => {
    const point = unproject(project({lat: 52.3731, lng: 4.8926}))
    expect(point.lat).toBeCloseTo(52.3731, 8)
    expect(point.lng).toBeCloseTo(4.8926, 8)
  })

})

describe("MapViewport", () => {

  it("places its center in the middle", () => {
    const viewport = new MapViewport({lat: 52.3731, lng: 4.8926}, 12)
    const [x, y] = viewport.pointToPixel({lat: 52.3731, lng: 4.8926}, {width: 800, height: 600})
    expect(x).toBeCloseTo(400)
    expect(y).toBeCloseTo(300)
  })

  it("fits bounds", () => {
    const bounds = {west: 4.7, south: 52.3, east: 5.0, north: 52.45}
    const size = {width: 800, height: 600}
    const viewport = MapViewport.fitBounds(bounds, size)

    const [left, top] = viewport.pointToPixel({lat: bounds.north, lng: bounds.west}, size)
    const [right, bottom] = viewport.pointToPixel({lat: bounds.south, lng: bounds.east}, size)
    expect(Math.min(left, top)).toBeGreaterThanOrEqual(-1e-6)
    expect(right).toBeLessThanOrEqual(800 + 1e-6)
    expect(bottom).toBeLessThanOrEqual(600 + 1e-6)
    expect(Math.min(left, 800 - right) < 1e-6 || Math.min(top, 600 - bottom) < 1e-6).toBe(true)
  })

})

describe("visibleTiles", () => {

  it("covers the whole map at integer zoom", () => {
    const tiles = visibleTiles(new MapViewport({lat: 0, lng: 0}, 2), {width: 1024, height: 1024})
    expect(tiles.map(it => it.tile)).toEqual([
      {z: 2, x: 1, y: 1}, {z: 2, x: 2, y: 1},
      {z: 2, x: 1, y: 2}, {z: 2, x: 2, y: 2},
    ])
    expect(tiles[0].rect).toMatchObject({left: 0, top: 0, width: 512, height: 512})
  })

  it("wraps x across the antimeridian", () => {
    const tiles = visibleTiles(new MapViewport({lat: 0, lng: 180}, 1), {width: 512, height: 512})
    expect(tiles.map(it => it.tile.x).sort()).toEqual([0, 0, 1, 1])
  })

})

describe("MapProps", () => {

  it("centers on the first marker without a center", () => {
    const props = MapProps.resolve({center: '', markers: [{location: '10, 20'}]})
    const viewport = MapProps.viewport(props, locateCached)
    expect(viewport.center).toEqual({lat: 10, lng: 20})
    expect(viewport.zoom).toEqual(7)
    expect(props.markers).toEqual([{location: '10, 20', color: '#E53935', size: 48, icon: null}])
  })

})
