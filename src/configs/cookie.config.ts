import { CookieOptions } from 'express'

export const cookieSecret = 'secret'
export const accessToken: TokenConfig = {
    name: 'access',
    options: {
        httpOnly: true
    },
    maxAge: 0
}
export const refreshToken: TokenConfig = {
    name: 'refresh',
    options: {
        httpOnly: true
    },
    maxAge: 1000 * 60 * 60 * 24 * 15
}

export type TokenConfig = { name: string; options: CookieOptions; maxAge: number }
