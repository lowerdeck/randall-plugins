import { describe, expect, it } from 'vitest'
import { animationFramesSpan } from '../widgetAnimationFrames'

describe("animationFramesSpan", () => {

  it("spans all animations", () => {
    expect(animationFramesSpan({a: {from: 10, to: 20}, b: {from: 5, to: 15}})).toEqual({from: 5, to: 20})
  })

  it("is null without animations", () => {
    expect(animationFramesSpan({})).toBeNull()
  })

})
