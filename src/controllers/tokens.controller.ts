import crypto from 'node:crypto'
import { User } from '@model/user.model'
import { JwtPayload } from 'jsonwebtoken'
import { JwtController } from '@auth/jwt'
import Database from '@database'

function generateAccessToken(user: User): string {
    const payload: JwtPayload = {
        tag: user.tag,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 15 * 60
    }
    return JwtController.sign(payload)
}

function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex')
}

async function storeRefreshToken(tag: string, token: string) {
    const database = await Database()
    await database.runOne('INSERT INTO refresh_tokens (user_tag, token) VALUES (?, ?)', [tag, token])
}

async function getUserRefreshToken(tag: string) {
    const database = await Database()
    const token = await database.getOne('SELECT token FROM refresh_tokens WHERE user_tag = ?', [tag])

    return token.token
}

export { generateAccessToken, generateRefreshToken, storeRefreshToken, getUserRefreshToken }
