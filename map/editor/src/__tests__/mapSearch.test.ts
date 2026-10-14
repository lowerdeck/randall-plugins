import { GeocodeResult } from '@randall-plugins/map'
import { WidgetEditState } from '@randall/plugin-sdk-editor'
import { describe, expect, it } from 'vitest'
import { mapSearch } from '../mapSearch'

describe('mapSearch', () => {

  const result: GeocodeResult = {label: 'Amsterdam', center: {lat: 52.3731, lng: 4.8926}, bounds: null}

  function state(values: Record<string, unknown>, extra: Partial<WidgetEditState> = {}): WidgetEditState {
    return {values, selection: null, transient: {}, size: {width: 640, height: 360}, isLocked: () => false, ...extra}
  }

  it('adds a marker if there are none, and selects it', () => {
    const edit = mapSearch.apply(result, state({markers: []}))
    expect(edit.select).toEqual('markers.0')
    expect(edit.changes).toContainEqual({path: 'markers.0', value: expect.objectContaining({location: '52.3731, 4.8926'})})
  })

  it('moves the selected marker', () => {
    const edit = mapSearch.apply(result, state({markers: [{}, {}]}, {selection: 'markers.1'}))
    expect(edit.changes).toContainEqual({path: 'markers.1.location', value: '52.3731, 4.8926'})
  })

  it('zooms to fit the bounds of the result, if any', () => {
    const bounds = {west: 4.7, south: 52.3, east: 5.0, north: 52.4}
    const edit = mapSearch.apply({...result, bounds}, state({markers: [{}]}))
    const zoom = edit.changes?.find(it => it.path === 'zoom')?.value
    expect(zoom).toBeGreaterThan(8)
    expect(zoom).toBeLessThan(14)
  })

  it('pans to the result if the center is bound', () => {
    const edit = mapSearch.apply(result, state({center: '52.18, 5.29', markers: [{}]}, {isLocked: path => path === 'center'}))
    expect(edit.transient).toEqual({pan: {lat: 52.3731, lng: 4.8926}})
    expect(edit.changes?.map(it => it.path)).not.toContain('center')
  })

})
