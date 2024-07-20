import { Router } from 'express'

import Database from '@database'
import { User } from '@model/user.model'
import tokenConfig from '@config/token.config'
import auth from '@middleware/authenticate.middleware'
import { createSalt, hashPassword, issueAuthCookies, randomString, revokeRefreshToken } from '@auth/auth'
import { AuthenticatingRequest, AuthenticatedRequest } from '@model/request.models'

const userRouter = Router()

userRouter.post('/create', async (req, res) => {
    const { tag } = req.body

    const salt = createSalt()
    const key = randomString(8)
    const user = hashPassword({ tag, salt, password: key, activated: false })
    await Database.runOnce('INSERT INTO users (tag, salt, password, activated) VALUES (?,?,?,?)', [user.tag, user.salt, user.password, user.activated])

    res.status(201).json({
        msg: 'user created!',
        try: 'activating the account using the issued activation-key',
        user: { ...user, key: user.password, password: undefined },
        key
    })
})

userRouter.post('/activate', async (req, res) => {
    const { tag, key, password } = req.body
    const user = await Database.getOne<User>('SELECT * FROM users WHERE tag = ? AND activated = ?', [tag, false])
    if (!user) return res.status(401).json({ error: 'unknown or activated user' })

    const passwordHash = hashPassword({ ...user, password: key })
    if (passwordHash.password !== user.password) return res.status(401).json({ error: 'invalid activation-key' })

    const hashedPassword = hashPassword({ ...user, password }).password
    await Database.runOnce('UPDATE users SET password = ?, activated = ? WHERE tag = ?', [hashedPassword, true, tag])

    await issueAuthCookies(user, res)
    res.status(200)
    res.json({ msg: 'activated and authenticated!' })
})

userRouter.post('/login', async (req: AuthenticatingRequest, res) => {
    const { tag, password } = req.body
    const user = await Database.getOne<User>('SELECT * FROM users WHERE tag = ?', [tag])
    if (!user) return res.status(401).json({ error: 'invalid credentials' })

    const passwordHash = hashPassword({ ...user, password })
    if (passwordHash.password !== user.password) return res.status(401).json({ error: 'invalid credentials' })

    await issueAuthCookies(user, res)
    res.status(200)
    res.json({ msg: 'authenticated' })
})

userRouter.get('/', auth, (dReq, res) => {
    const req = dReq as AuthenticatedRequest
    return res.status(200).json({ ...req.atkn })
})

userRouter.post('/logout', auth, (dReq, res) => {
    const req = dReq as AuthenticatedRequest
    revokeRefreshToken(req.atkn.tag)
    res.clearCookie(tokenConfig.aTkn.cookieName)
    res.clearCookie(tokenConfig.rTkn.cookieName)
    res.status(200)
    res.json({ msg: 'logged out' })
})

export default userRouter
