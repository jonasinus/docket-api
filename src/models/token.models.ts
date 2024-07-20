type AccessTokenPayload = {
    tag: string
    activated: boolean
}

type RefreshTokenPayload = {
    rdm: string
}

export type { AccessTokenPayload, RefreshTokenPayload }
