import crypto from 'node:crypto'
import { User } from '@model/user.model'
import config from '@config/encryption'
import Database from '@database'
import DatabaseError from '@error/database'

async function createUser(tag: string, password: string): Promise<User | never> {
    const db = await Database()

    try {
        const [existingUser] = await db.getAll('SELECT * FROM users WHERE tag = ?', [tag])

        if (existingUser.length > 0) {
            throw new TagInUseError('This tag is already in use. Please choose another one.')
        }
    } catch (err) {
        throw new DatabaseError(null, 'Error checking for existing user', 'SELECT * FROM users WHERE tag = ?', [tag])
    }

    const salt = crypto.randomBytes(config.saltLength).toString(config.saltEnc)
    const hash = crypto.pbkdf2Sync(password, salt, config.iterations, config.keyLength, config.digest)

    try {
        const result = await db.runOne('INSERT INTO users (tag, password, salt) VALUES (?, ?, ?)', [tag, hash, salt])

        if (result.affectedRows !== 1) {
            throw new DatabaseError(null, 'Failed to create user. Please try again.')
        }

        return { tag, password: hash.toString(), salt }
    } catch (err) {
        throw new DatabaseError(null, 'Error creating user', 'INSERT INTO users (tag, password, salt) VALUES (?, ?, ?)', [tag, hash, salt])
    }
}

class TagInUseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'TagInUseError'
    }
}

export { createUser }
