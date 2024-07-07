import Express from 'express'
import { authTokenName } from '@config/cookies'
import { JwtController } from '@auth/jwt'
import { authenticate } from '@auth/requireAuth'
import { createUser } from '@controller/user.controller'
import { Request } from '@'

const userRouter = Express.Router()

userRouter.get('/', authenticate, (req: Request, res) => {
    res.status(200).json({ token: req.token, user: req.user, proT: Date.now(), recT: req.receivedAt })
})

userRouter.post('/create', async (req, res) => {
    const { tag, password } = req.body

    const user = createUser(tag, password)
        .then((user) => {
            res.cookie(authTokenName, JwtController.sign({ tag }))
            res.status(201).json({ msg: 'user created!' })
        })
        .catch((err) => {
            res.status(500).json({ error: 'could not create user' })
        })
})

userRouter.post('/login', (req, res) => {
    const { name: tag, password } = req.body

    res.cookie(authTokenName, JwtController.sign({ tag }))
    res.status(200).json({ msg: 'authenticated!' })
})

userRouter.post('/logout', authenticate, (req, res) => {
    res.clearCookie(authTokenName)
    res.status(200).json({ msg: 'logged out!' })
})

export default userRouter
