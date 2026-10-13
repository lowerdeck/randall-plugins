import { z } from 'zod'

export interface GeoBounds {
  west:  number
  south: number
  east:  number
  north: number
}

export namespace GeoBounds {

  export function is(arg: unknown): arg is GeoBounds {
    return schema.safeParse(arg).success
  }

  export const schema: z.ZodType<GeoBounds> = z.object({
    west:  z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east:  z.number().min(-180).max(180),
    north: z.number().min(-90).max(90),
  }).refine(it => it.north > it.south, {message: 'North must be above south'})

}
