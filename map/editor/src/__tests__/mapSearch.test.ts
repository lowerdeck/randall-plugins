import { WidgetEditState } from '@randall/plugin-sdk-editor'
import { describe, expect, it } from 'vitest'
import { GeocodeResult } from '../GeocodeResult'
import { mapSearch } from '../mapSearch'

describe('mapSearch', () => {

  const result: GeocodeResult = {label: 'Amsterdam', center: {lat: 52.3731, lng: 4.8926}, bounds: null}

  function state(values: Record<string, unknown>, extra: Partial<WidgetEditState> = {}): WidgetEditState {
    return {values, selection: null, size: {width: 640, height: 360}, isLocked: () => false, ...extra}
  }

  it('adds a marker if there are none, and selects it', () => {
    const edit = mapSearch.apply(result, state({markers: []}))
    expect(edit.select).toEqual('markers.0')
    expect(edit.changes).toContainEqual({path: 'markers.0', value: expect.objectContaining({location: result.center})})
  })

  it('moves the selected marker', () => {
    const edit = mapSearch.apply(result, state({markers: [{}, {}]}, {selection: 'markers.1'}))
    expect(edit.changes).toContainEqual({path: 'markers.1.location', value: result.center})
  })

  it('shows the bounds of the result, if any', () => {
    const bounds = {west: 4.7, south: 52.3, east: 5.0, north: 52.4}
    const edit = mapSearch.apply({...result, bounds}, state({markers: [{}]}))
    expect(edit.changes).toContainEqual({path: 'bounds', value: bounds})
  })

  it('leaves the view alone if it is bound to data', () => {
    const edit = mapSearch.apply(result, state({markers: [{}]}, {isLocked: path => path === 'zoom'}))
    expect(edit.changes?.map(it => it.path)).toEqual(['markers.0.location'])
  })

})
