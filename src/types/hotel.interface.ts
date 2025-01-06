import type { Base } from './base.interface'

export interface Hotel extends Base {
  title: string
  country: string
}
export type DenseHotel = Pick<Hotel, 'id' | 'title' | 'country'>
