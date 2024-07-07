import jwt, { JwtPayload } from 'jsonwebtoken'

const secret = 'secretkey'

function sign(payload: JwtPayload) {
    return jwt.sign(payload, secret)
}

function validate(token: string) {
    return jwt.verify(token, secret) as { tag: string; iat: number }
}

function decodeAuthToken(token: string): { tag: string; iat: number } {
    return jwt.decode(token) as { tag: string; iat: number }
}

export const JwtController = { sign, validate, decodeAuthToken }

interface JwtController {
    sign: (payload: JwtPayload) => string
    validate: (token: string) => {
        tag: string
        iat: number
    }
}
