import Express from 'express'
import { WebSocketServer } from 'ws'
import cookieParser from 'cookie-parser'
import { hostIp } from './hostIp.config'

const App = IApp()

function IApp() {
    const cookieSecret = 'secret'
    const iapp = Express()
    iapp.use(Express.json())
    iapp.use(cookieParser(cookieSecret))

    const port = parseInt(process.env.PORT || '3000')
    const server = iapp.listen(port, () => {
        console.info('[info]: app listening' + `\n\t    > http://127.0.0.1:${port}` + `${hostIp ? `\n\t    > http://${hostIp}:${port}` : ''}`)
    })

    const wss = new WebSocketServer({ server, path: '/ws' })
    wss.on('listening', () => {
        console.info('[info]: configuring wss')
        console.info('[info]: wss listening' + `\n\t    > ws://127.0.0.1:${port}/ws` + `${hostIp ? `\n\t    > ws://${hostIp}:${port}/ws` : ''}`)
    })

    return {
        app: iapp,
        server,
        port,
        wss,
        cookie: {
            secret: cookieSecret
        }
    }
}

const app = App.app
const server = App.server
const wss = App.wss
const port = App.port

export default App
export { app, server, wss, port }
