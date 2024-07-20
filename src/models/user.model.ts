type User = {
    tag: string
    password: string
    salt: string
    activated: boolean
}

type UserTokenPayload = {
    tag: string
    activated: boolean
}

export type { User, UserTokenPayload }
