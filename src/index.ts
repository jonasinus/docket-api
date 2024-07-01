import Express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/user.router'
import cookieParser from 'cookie-parser'
import fileRouter from './routes/file.router'

dotenv.config()

const app = Express()

app.use(Express.json())
app.use(cookieParser())

app.use('/user', userRouter)
app.use('/files', fileRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`[SERVER]: listening on port ${PORT}`)
})
