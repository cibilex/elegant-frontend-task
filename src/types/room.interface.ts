import type { Base } from './base.interface'
import type { DenseHotel } from './hotel.interface'
export interface Room extends Base {
  price: number
  hotel: DenseHotel
  type: RoomTypes
}

export enum RoomTypes {
  BASIC = 1,
  PREMIUM,
  SUITE,
}
