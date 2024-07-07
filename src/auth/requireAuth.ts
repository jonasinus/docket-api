import Express, { NextFunction } from 'express'
import { Request } from '@'
import { JwtController } from '@auth/jwt'
import Database from '@database'

async function authenticate(req: Request, res: Express.Response, next: NextFunction) {
    try {
        const token = req.cookies.token
        const database = await Database()

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
