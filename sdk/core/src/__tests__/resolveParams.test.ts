import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { namedParams } from '../namedParams'
import { param } from '../param'
import { resolveParams } from '../resolveParams'

describe('resolveParams', () => {

  const params = namedParams([
    param.number('zoom', {min: 0, max: 22, default: 12}),
    param.choice('style', {choices: [{value: 'a', label: 'A'}, {value: 'b', label: 'B'}], default: 'a'}),
    param.boolean('shown', {default: true}),
    param.custom('origin', {schema: z.tuple([z.number(), z.number()]).nullable(), default: null}),
    param.array('items', {
      itemLabel: 'Item',
      item:      param.object('item', {params: [param.color('color', {default: '#ff0000'})]}),
      default:   [],
    }),
  ])

  it('fills in defaults for missing values', () => {
    expect(resolveParams(params, {})).toEqual({zoom: 12, style: 'a', shown: true, origin: null, items: []})
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
