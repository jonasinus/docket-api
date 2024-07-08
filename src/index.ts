import Express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import { User } from '@model/user.model'
import Database from '@database'
import { hostIp } from '@config/hostIp.config'
import userRouter from '@route/user.router'
import { randomString } from '@auth/auth'
import { checkTagAvailability } from '@controller/user.controller'
import { cookieSecret } from '@config/cookie.config'

interface Request extends Express.Request {
    user?: Omit<Omit<User, 'password'>, 'salt'>
    authenticated?: boolean
    authorization?: number
}

process.stdout.write('\x1Bc')

dotenv.config()
Database.config({
    host: process.env.DBHOST,
    database: process.env.DBDATABASE,
    user: process.env.DBUSER,
    password: process.env.DBPASWD,
    port: process.env.DBPORT
}).connect()

const app = Express()
const port = parseInt(process.env.PORT || '3000')

app.use(Express.json())
app.use(cookieParser(cookieSecret))

app.use('/user', userRouter)
app.use((req, res) => res.status(404).json({ error: 'invalid route' }))

app.listen(port, () => {
    console.info(`[info]: app listening\r\n\t> http://127.0.0.1:${port} ${hostIp ? `\r\n\t> http://${hostIp}:${port}` : ''}`)
})

export type { Request }
export default app
