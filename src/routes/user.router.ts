import Express from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { UserController } from '../controllers/user.controller'
import { authTokenName } from '../config/cookies'
import { JwtController } from '../auth/jwt'
import { authenticate, Request } from '../auth/requireAuth'

const userRouter = Express.Router()

userRouter.get('/', authenticate, (req: Request, res) => {
    res.status(200).json({ token: req.token, user: req.user })
})

userRouter.post('/create', (req, res) => {
    const { name, password } = req.body

    const exists = UserController.findUserBy({ name })

    if (exists !== undefined) return res.status(401).json({ error: 'username already taken' })

    UserController.addUser({ name, password })

    return res.status(201).json({ msg: 'user created!' })
})

userRouter.post('/login', (req, res) => {
    const { name, password } = req.body
    const exists = UserController.findUserBy({ name })
    if (exists === undefined || exists.password !== password) return res.status(400).json({ error: 'no user exists with that password' })

    res.cookie(authTokenName, JwtController.sign({ name }))
    res.status(200).json({ msg: 'authenticated!' })
})

userRouter.post('/logout', authenticate, (req, res) => {
    res.clearCookie(authTokenName)
    res.status(200).json({ msg: 'logged out!' })
})

export default userRouter
