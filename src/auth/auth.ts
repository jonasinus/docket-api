import { User, UserTokenPayload } from '@model/user.model'
import crypto from 'node:crypto'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import Database from '@database'
import tokenConfig from '@config/token.config'
import { AccessTokenPayload, RefreshTokenPayload } from '@model/token.models'
import Express from 'express'

function createSalt(): string {
    return crypto.randomBytes(32).toString('hex')
}

function randomString(length: number, exclude?: string[]) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let result = ''
    do {
        result = ''
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length)
            result += characters.charAt(randomIndex)
        }
    } while (exclude && exclude.includes(result))

    return result
}

function hash(string: string): string {
    return crypto.createHash('sha256').update(string).digest().toString()
}

function hashPassword(user: User): User {
    const newPassword = crypto.pbkdf2Sync(user.password, user.salt, 100000, 64, 'sha512').toString('hex')
    return {
        ...user,
        password: newPassword
    }
}

const jwtSecret = process.env.JWTSECRET || 'secret'

function signToken(payload: Object, options?: SignOptions) {
    return jwt.sign(payload, jwtSecret, options)
}

async function generateTokens(accessTokenPayload: AccessTokenPayload) {
    const refreshTokenPayload: RefreshTokenPayload = { rdm: randomString(32) }
    const refreshToken = jwt.sign(refreshTokenPayload, tokenConfig.rTkn.secret, { expiresIn: '15d' })
    const accessToken = jwt.sign(accessTokenPayload, tokenConfig.aTkn.secret, { expiresIn: '1m' })
    await Database.runOnce('INSERT INTO refresh_tokens (user_tag, token, valid) VALUES (?, ?, ?)', [accessTokenPayload.tag, refreshTokenPayload.rdm, true])
    return {
        refreshToken,
        accessToken
    }
}

async function revokeRefreshToken(userTag: string) {
    await Database.runOnce('UPDATE refresh_tokens SET valid = ? WHERE user_tag = ?', [false, userTag])
}

async function issueAuthCookies(accessTokenPayload: AccessTokenPayload, res: Express.Response, options?: { removePrevious?: boolean }) {
    if (options && options.removePrevious) {
        res.clearCookie(tokenConfig.aTkn.cookieName)
        res.clearCookie(tokenConfig.rTkn.cookieName)
        revokeRefreshToken(accessTokenPayload.tag)
    }
    const tokens = await generateTokens(accessTokenPayload)
    res.cookie(tokenConfig.aTkn.cookieName, tokens.accessToken)
    res.cookie(tokenConfig.rTkn.cookieName, tokens.refreshToken)
}

export { createSalt, randomString, hash, hashPassword, signToken, revokeRefreshToken, generateTokens, issueAuthCookies }
