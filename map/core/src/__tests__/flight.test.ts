import { widgetAnimationFrames } from '@randall/plugin-sdk'
import { describe, expect, it } from 'vitest'
import { flightPath, flightProgress } from '../flight'
import { MapViewport } from '../geo'
import { MapProps } from '../MapProps'
import { mapWidget } from '../mapWidget'

describe("flightPath", () => {

  const size = {width: 1920, height: 1080}
  const amsterdam = new MapViewport({lat: 52.37, lng: 4.89}, 10)
  const newYork = new MapViewport({lat: 40.71, lng: -74.01}, 12)

  it("starts and ends at its viewports", () => {
    const path = flightPath(amsterdam, newYork, size)
    expect(path(0)).toBe(amsterdam)
    expect(path(1)).toBe(newYork)
  })

  it("zooms out on the way", () => {
    const path = flightPath(amsterdam, newYork, size)
    expect(path(0.5).zoom).toBeLessThan(amsterdam.zoom - 3)
  })

  it("moves continuously", () => {
    const path = flightPath(amsterdam, newYork, size)
    const near = path(0.999)
    expect(near.center.lat).toBeCloseTo(newYork.center.lat, 1)
    expect(near.center.lng).toBeCloseTo(newYork.center.lng, 1)
    expect(near.zoom).toBeCloseTo(newYork.zoom, 1)
  })

  it("crosses the antimeridian if that's shorter", () => {
    const tokyo = new MapViewport({lat: 35.68, lng: 139.69}, 8)
    const sanFrancisco = new MapViewport({lat: 37.77, lng: -122.42}, 8)
    const halfway = flightPath(tokyo, sanFrancisco, size)(0.5)
    expect(Math.abs(halfway.center.lng)).toBeGreaterThan(150)
  })

  it("only zooms if the center stays", () => {
    const zoomed = new MapViewport(amsterdam.center, 14)
    const halfway = flightPath(amsterdam, zoomed, size)(0.5)
    expect(halfway.center.lat).toBeCloseTo(amsterdam.center.lat, 6)
    expect(halfway.zoom).toBeGreaterThan(10)
    expect(halfway.zoom).toBeLessThan(14)
  })

})

describe("flightProgress", () => {

  const frames = {from: 25, to: 75}

  it("eases from the start to the end", () => {
    expect(flightProgress(0, frames)).toBe(0)
    expect(flightProgress(25, frames)).toBe(0)
    expect(flightProgress(50, frames)).toBeCloseTo(0.5)
    expect(flightProgress(75, frames)).toBe(1)
    expect(flightProgress(100, frames)).toBe(1)
  })

})

describe("flightAnimations", () => {

  const props = MapProps.resolve({fly_to: 'New York'})

  it("takes the frames of the template", () => {
    expect(widgetAnimationFrames(mapWidget, props, {flight: {from: 25, to: 75}}, 25)).toEqual({flight: {from: 25, to: 75}})
  })

  it("spans the first seconds without frames", () => {
    expect(widgetAnimationFrames(mapWidget, props, {}, 25)).toEqual({flight: {from: 0, to: 75}})
  })

  it("has none without a destination", () => {
    expect(widgetAnimationFrames(mapWidget, MapProps.resolve({}), {flight: {from: 25, to: 75}}, 25)).toEqual({})
  })

})
