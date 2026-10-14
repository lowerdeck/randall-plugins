import { describe, expect, it } from 'vitest'
import { centeredGrid } from '../centeredGrid'

describe("centeredGrid", () => {

  it("puts a single cell at the origin", () => {
    expect(centeredGrid(1, 10, 20)).toEqual([[0, 0]])
  })

  it("puts two cells side by side", () => {
    expect(centeredGrid(2, 10, 20)).toEqual([[-5, 0], [5, 0]])
  })

  it("centers a last row that isn't full", () => {
    expect(centeredGrid(3, 10, 20)).toEqual([[-5, -10], [5, -10], [0, 10]])
  })

  it("fills a square", () => {
    expect(centeredGrid(4, 10, 20)).toEqual([[-5, -10], [5, -10], [-5, 10], [5, 10]])
  })

})
