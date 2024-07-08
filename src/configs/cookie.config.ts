import { CookieOptions } from 'express'

export const cookieSecret = 'secret'
export const accessToken: { name: string; options: CookieOptions } = {
    name: 'access',
    options: {
        maxAge: 1000 * 60 * 15
    }
}
