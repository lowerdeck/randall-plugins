// Offsets that lay out `count` cells in a grid around the origin, as square as possible. Rows are filled left to right,
// and a last row that isn't full is centered.
export function centeredGrid(count: number, cellWidth: number, cellHeight: number): Array<[number, number]> {
  const columns = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / columns)

  const offsets: Array<[number, number]> = []
  for (let index = 0; index < count; index++) {
    const row = Math.floor(index / columns)
    const inRow = Math.min(columns, count - row * columns)
    const column = index % columns
    offsets.push([
      (column - (inRow - 1) / 2) * cellWidth,
      (row - (rows - 1) / 2) * cellHeight,
    ])
  }
  return offsets
}
