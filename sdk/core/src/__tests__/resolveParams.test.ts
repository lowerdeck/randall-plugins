import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { param } from '../param'
import { resolveParams } from '../resolveParams'

describe('resolveParams', () => {

  const params = {
    zoom:   param.number({label: 'Zoom', min: 0, max: 22, default: 12}),
    style:  param.choice({label: 'Style', choices: [{value: 'a', label: 'A'}, {value: 'b', label: 'B'}], default: 'a'}),
    shown:  param.boolean({label: 'Shown', default: true}),
    origin: param.custom({label: 'Origin', schema: z.tuple([z.number(), z.number()]).nullable(), default: null}),
    items:  param.list({
      label:     'Items',
      itemLabel: 'Item',
      item:      {color: param.color({label: 'Color', default: '#ff0000'})},
      default:   [],
    }),
  }

  it('fills in defaults for missing values', () => {
    expect(resolveParams(params, {})).toEqual({zoom: 12, style: 'a', shown: true, origin: null, items: []})
  })

  it('coerces values bound to data', () => {
    expect(resolveParams(params, {zoom: '8', shown: 'no'})).toMatchObject({zoom: 8, shown: false})
  })

  it('falls back to the default for invalid values', () => {
    expect(resolveParams(params, {zoom: 40, style: 'c', origin: 'here'})).toMatchObject({zoom: 12, style: 'a', origin: null})
  })

  it('validates with custom schemas', () => {
    expect(resolveParams(params, {origin: [1, 2]})).toMatchObject({origin: [1, 2]})
  })

  it('resolves list items, dropping empty ones', () => {
    expect(resolveParams(params, {items: [{color: '#00ff00'}, null, {}, {color: 'red'}]})).toMatchObject({
      items: [{color: '#00ff00'}, {color: '#ff0000'}, {color: '#ff0000'}],
    })
  })

})
