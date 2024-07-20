import { createSalt, randomString } from '@auth'
import Database from '@database'
import { User } from '@models'

async function createUser(tag: string): Promise<User> {
    const tagTaken = await Database.getOne('SELECT * FROM users WHERE tag = ?', [tag])
    if (tagTaken) throw new Error('tag already taken')

    const user: User = {
        tag,
        password: randomString(8),
        salt: createSalt(),
        activated: false
    }

    Database.runOnce('INSERT INTO users (tag, password, salt, activated) values(?,?,?,?)', [user.tag, user.password, user.salt, user.activated])
    return user
}

async function checkTagAvailability(tag: string): Promise<'taken' | 'available'> {
    const tagTaken = await Database.getOne('SELECT * FROM users WHERE tag = ?', [tag])
    return tagTaken ? 'taken' : 'available'
}

async function getUser(tag: string): Promise<User | null> {
    const user = await Database.getOne<User>('SELECT * FROM users WHERE tag = ?', [tag])
    return user
}

async function updateUser(user: User): Promise<void> {
    const result = await Database.runOnce('UPDATE users SET tag = ?, salt = ?, password = ?, activated = ? WHERE tag = ?', [
        user.tag,
        user.salt,
        user.password,
        user.activated,
        user.tag
    ])
    console.log(result)
}

export { createUser, checkTagAvailability, getUser, updateUser }
