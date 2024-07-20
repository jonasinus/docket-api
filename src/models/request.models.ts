import { AccessTokenPayload } from '@model/token.models'
import Express from 'express'

interface AuthenticatingRequest extends Express.Request {
    atkn?: AccessTokenPayload
    authState?: {
        tokens?: {
            accessTokenValid: boolean | 'unknown'
            refreshTokenValid: boolean | 'unknown'
            tokensReissued: boolean | 'unknown'
        }
    }
}

interface AuthenticatedRequest extends Express.Request {
    atkn: AccessTokenPayload
    authState: {
        tokens: {
            accessTokenValid: boolean | 'unknown'
            refreshTokenValid: boolean | 'unknown'
            tokensReissued: boolean | 'unknown'
        }
    }
}

export type { AuthenticatedRequest, AuthenticatingRequest }
