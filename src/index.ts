import Express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { JwtPayload } from 'jsonwebtoken'
import userRouter from '@route/user.router'
import fileRouter from '@route/file.router'
import { storeRefreshToken, generateRefreshToken, getUserRefreshToken } from '@controller/tokens.controller'

interface Request extends Express.Request {
    receivedAt?: number
    processedAt?: number
    token?: string | JwtPayload
    user?: { tag: string; iat: number }
}

dotenv.config()

const app = Express()

app.use((req: Request, res: Express.Response, next: Express.NextFunction) => {
    req.receivedAt = Date.now()
    next()
})
app.use(Express.json())
app.use(cookieParser())

app.use('/user', userRouter)
app.use('/files', fileRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`[SERVER]: listening on port ${PORT}`)
})

export { Request, PORT }
export default app
;(async () => {
    const rtken = await getUserRefreshToken('jonas')
    if (!rtken) storeRefreshToken('jonas', generateRefreshToken())
    else console.log(rtken)
})()
