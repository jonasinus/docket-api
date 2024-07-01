import jwt, { Jwt, JwtPayload } from 'jsonwebtoken'
import { parentPort } from 'worker_threads'
import { User } from '../controllers/user.controller'

const secret = 'secretkey'

function sign(payload: JwtPayload) {
    return jwt.sign(payload, secret)
}

function validate(token: string) {
    return jwt.verify(token, secret)
}

function decodeAuthToken(token: string): { name: string; iat: number } {
    return jwt.decode(token) as { name: string; iat: number }
}

export const JwtController = { sign, validate, decodeAuthToken }
