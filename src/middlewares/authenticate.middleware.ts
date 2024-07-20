import jwt from 'jsonwebtoken'
import Express from 'express'

import { User } from '@models'
import Database from '@database'
import { TokenConfig } from '@configs'
import { issueAuthCookies } from '@auth'
import { AuthenticatingRequest } from '@models'
import { AccessTokenPayload, RefreshTokenPayload } from '@models'

async function auth(req: AuthenticatingRequest, res: Express.Response, next: Express.NextFunction) {
    const accessTokenCookie = req.cookies[TokenConfig.aTkn.cookieName]
    if (!accessTokenCookie) return res.status(401).json({ error: 'no valid token provided' })

    try {
        const accessTokenPayload: AccessTokenPayload = jwt.verify(accessTokenCookie, TokenConfig.aTkn.secret) as AccessTokenPayload
        req.atkn = accessTokenPayload
        req.authState = {
            tokens: {
                accessTokenValid: true,
                refreshTokenValid: 'unknown',
                tokensReissued: true
            }
        }

        await issueAuthCookies(accessTokenPayload, res, { removePrevious: true })
        return next()
    } catch (err) {
        req.authState = {
            tokens: {
                accessTokenValid: false,
                refreshTokenValid: 'unknown',
                tokensReissued: 'unknown'
            }
        }
    }

    const refreshTokenCookie = req.cookies[TokenConfig.rTkn.cookieName]
    if (!refreshTokenCookie) return res.status(401).json({ error: 'no valid token provided' })

    try {
        const user = await checkRefreshToken(refreshTokenCookie)
        req.atkn = user as AccessTokenPayload
        req.authState = {
            tokens: {
                accessTokenValid: 'unknown',
                refreshTokenValid: true,
                tokensReissued: true
            }
        }
        await issueAuthCookies(user, res)
        return next()
    } catch (err) {
        return res.status(401).json({ error: 'invalid access token' })
    }
}

async function checkRefreshToken(refreshTokenCookie: string) {
    const refreshTokenPayload: RefreshTokenPayload = jwt.verify(refreshTokenCookie, TokenConfig.rTkn.secret) as RefreshTokenPayload
    const user = (await Database.getOne<User>(
        'SELECT users.* FROM users INNER JOIN refresh_tokens ON users.tag = refresh_tokens.user_tag WHERE refresh_tokens.token = ?',
        [refreshTokenPayload.rdm]
    )) as User
    return user
}

export default auth
