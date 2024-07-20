import dotenv from 'dotenv'

import Database from '@database'
import userRouter from '@route/user.router'
import Console from '@config/console.config'
import { app } from '@config/app.config'

Console.config().enable()
dotenv.config()
Database.config({
    host: process.env.DBHOST,
    database: process.env.DBDATABASE,
    user: process.env.DBUSER,
    password: process.env.DBPASWD,
    port: process.env.DBPORT
}).connect()

app.use('/user', userRouter)

export default app
