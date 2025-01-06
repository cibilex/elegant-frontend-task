import type { CommonTableStatuses } from './common.types'

export enum UserTypes {
  ADMIN = 1,
  USER,
}

export interface User {
  email: string
  type: UserTypes
  status: CommonTableStatuses
}
