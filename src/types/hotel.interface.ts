import type { Base } from './base.interface'

export interface Hotel extends Base {
  title: string
  description: string
  price: number
}
export type DenseBook = Pick<Hotel, 'id' | 'title' | 'price'>
