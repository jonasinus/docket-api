import Express, { NextFunction } from 'express'
import { JwtController } from './jwt'
import { JwtPayload } from 'jsonwebtoken'

export interface Request extends Express.Request {
    token?: string | JwtPayload
    user?: { name: string; iat: number }
}

function authenticate(req: Request, res: Express.Response, next: NextFunction) {
    try {
        const token = req.cookies.token

        if (!token || token.trim() === '') return res.status(401).json({ error: 'no token in cookie provided' })

        const decoded = JwtController.decodeAuthToken(token)
        req.token = token
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ error: 'error validating token', err })
    }
}

export { authenticate }
