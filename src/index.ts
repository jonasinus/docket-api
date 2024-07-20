import dotenv from 'dotenv'

import Database from '@database'
import { userRouter } from '@routes'
import { Console, app } from '@configs'

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
