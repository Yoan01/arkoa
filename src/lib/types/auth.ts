import { User } from 'better-auth'

export type AuthenticatedUser = Pick<User, 'id'>
