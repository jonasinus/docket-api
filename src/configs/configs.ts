import App, { app, port, server, wss } from './app.config'
import cconsole from './console.config'
import TokenConfig from './token.config'
import { hostIp } from './hostIp.config'

export { App, app, port, server, wss, TokenConfig, hostIp }
const Console = cconsole
export { Console }
