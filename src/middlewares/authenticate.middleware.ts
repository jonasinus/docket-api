import { issueAuthCookies } from '@auth/auth'
import tokenConfig from '@config/token.config'
import Database from '@database'
import { AuthenticatingRequest } from '@model/request.models'
import { AccessTokenPayload, RefreshTokenPayload } from '@model/token.models'
import { User } from '@model/user.model'
import jwt from 'jsonwebtoken'
import Express from 'express'

async function auth(req: AuthenticatingRequest, res: Express.Response, next: Express.NextFunction) {
    const accessTokenCookie = req.cookies[tokenConfig.aTkn.cookieName]
    if (!accessTokenCookie) return res.status(401).json({ error: 'no valid token provided' })

    try {
        const accessTokenPayload: AccessTokenPayload = jwt.verify(accessTokenCookie, tokenConfig.aTkn.secret) as AccessTokenPayload
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

    const refreshTokenCookie = req.cookies[tokenConfig.rTkn.cookieName]
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
    const refreshTokenPayload: RefreshTokenPayload = jwt.verify(refreshTokenCookie, tokenConfig.rTkn.secret) as RefreshTokenPayload
    const user = (await Database.getOne<User>(
        'SELECT users.* FROM users INNER JOIN refresh_tokens ON users.tag = refresh_tokens.user_tag WHERE refresh_tokens.token = ?',
        [refreshTokenPayload.rdm]
    )) as User
    return user
}

export default auth
