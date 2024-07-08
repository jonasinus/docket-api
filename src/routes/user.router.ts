import { NextFunction, Response, Router } from 'express'
import { Request } from '@'
import { User } from '@model/user.model'
import { accessToken } from '@config/cookie.config'
import { hashPassword, signToken, validateToken } from '@auth/auth'
import { checkTagAvailability, createUser, getUser, updateUser } from '@controller/user.controller'

const userRouter = Router()

userRouter.get('/', authenticate, async (req: Request, res) => {
    res.status(200).json({ user: req.user, authenticated: req.authenticated, authorization: req.authorization })
})

userRouter.post('/create', async (req, res) => {
    const { tag } = req.body
    if (typeof tag !== 'string') return res.status(401).json({ error: 'req.body.tag must be provided' })

    const tagAvailable = await checkTagAvailability(tag)
    if (tagAvailable == 'taken') return res.status(401).json({ error: 'tag already taken', try: 'a different tag' })

    const user = await createUser(tag)
    res.status(201).json({ msg: 'created user, activate it', user })
})

userRouter.post('/activate', async (req, res) => {
    const { tag, password, newPassword } = req.body
    if (typeof tag !== 'string' || typeof password !== 'string' || typeof newPassword !== 'string')
        return res.status(401).json({ error: 'req.body.tag, req.body.password and req.body.newPassword must be provided' })

    const user = await getUser(tag)
    if (!user) return res.status(401).json({ error: 'no user with this tag found', try: 'checking if input tag is correct' })

    if (user.activated) return res.status(401).json({ error: 'user already activated' })

    user.activated = true
    user.password = newPassword
    await updateUser(hashPassword(user))

    res.status(200).json({ msg: 'user activated, password updated!' })
})

userRouter.post('/login', async (req, res) => {
    const { tag, password } = req.body
    if (typeof tag !== 'string' || typeof password !== 'string') return res.status(401).json({ error: 'req.body.tag and req.body.password must be provided' })

    const user = await getUser(tag)
    if (!user) return res.status(401).json({ error: 'no user with this tag found', try: 'checking if input tag is correct' })

    if (!user.activated) return res.status(401).json({ error: 'user must be activated before use', try: 'activating the account at /activate' })

    const hash = hashPassword({ ...user, password })
    if (hash.password !== user.password) return res.status(401).json({ error: 'invalid tag-password combination' })

    res.cookie(accessToken.name, signToken({ ...user, password: undefined, salt: undefined }), { ...accessToken.options, signed: true })
    res.status(200)
    res.json({ msg: 'logged in!' })
})

userRouter.post('/logout', authenticate, (req: Request, res) => {
    res.clearCookie(accessToken.name)
    res.status(200)
    res.json({ msg: 'logged out!' })
})

async function authenticate(req: Request, res: Response, next: NextFunction) {
    const cookies = req.signedCookies
    if (!cookies || typeof cookies !== 'object' || cookies[accessToken.name] == undefined)
        return res.status(401).json({ error: 'access cookie(s) missing', try: 'signing in again' })

    const tokenValid = validateToken(cookies[accessToken.name])
    if (!tokenValid) return res.status(401).json({ error: 'access token invalid', try: 'signing in again' })

    req.user = tokenValid as Omit<Omit<User, 'password'>, 'salt'>
    req.authenticated = true
    req.authorization = 0
    next()
}

export default userRouter
