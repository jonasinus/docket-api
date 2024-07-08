import { User } from '@model/user.model'
import crypto from 'node:crypto'
import jwt, { SignOptions } from 'jsonwebtoken'

function createSalt(): string {
    return crypto.randomBytes(32).toString('hex')
}

function randomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let result = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
    }

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

function validateToken(token: string): Object | false {
    try {
        return jwt.verify(token, jwtSecret)
    } catch (err) {
        return false
    }
}

export { createSalt, randomString, hash, hashPassword, signToken, validateToken }
