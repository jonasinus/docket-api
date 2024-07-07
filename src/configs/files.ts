import { join, resolve } from 'path'

export const usersFile = join(resolve(), 'data', 'users.json')
export const userFile = (name: string) => join(resolve(), 'data', 'users', name)
export const fileEnc = 'utf-16le'
