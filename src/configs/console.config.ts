function coloredConsole() {
    const originalConsole = { ...console }
    const newConsole = { ...console }

    const timeLogs: { [label: string]: number } = {}

    newConsole.info = function (...data: any[]): void {
        if (typeof data[0] === 'string') {
            if (data[0].startsWith('[info]:')) data[0] = data[0].substring(7).trimStart()
        }
        originalConsole.log('\x1b[36m', '[Info]: ', '\x1b[0m', ...data)
    }

    newConsole.error = function (...data: any[]): void {
        if (typeof data[0] === 'string') {
            if (data[0].startsWith('[error]:')) data[0] = data[0].substring(7)
        }
        originalConsole.log('\x1b[31m', '[Error]:', '\x1b[0m', ...data)
    }

    newConsole.warn = function (...data: any[]): void {
        if (typeof data[0] === 'string') {
            if (data[0].startsWith('[warn]:')) data[0] = data[0].substring(7)
        }
        originalConsole.log('\x1b[33m', '[Warn]: ', '\x1b[0m', ...data)
    }

    newConsole.timeEnd = function (label?: string): void {
        const diff = Date.now() - timeLogs[label ?? ''] || 0
        originalConsole.log('\x1b[35m', '[Time]: ', '\x1b[0m', (label ? label + ': ' : '') + diff)
    }

    newConsole.timeLog = function (label?: string): void {
        const diff = Date.now() - timeLogs[label ?? ''] || 0
        originalConsole.log('\x1b[35m', '[Time]: ', '\x1b[0m', (label ? label + ': ' : '') + diff)
    }

    newConsole.timeStamp = function (label?: string): void {
        originalConsole.log('\x1b[35m', label ? '[' + label + ']:' : '[Timestamp]:', '\x1b[0m', new Date().toString())
    }

    newConsole.time = function (label?: string): void {
        if (label === undefined) label = ''
        if (timeLogs[label] !== undefined) console.warn("Label '" + label + "' already in use for console.time()")
        timeLogs[label] = Date.now()
        console.info({ timeLogs })
    }

    newConsole.log = function (...data: any[]): void {
        if (typeof data[0] === 'string') {
            if (data[0].startsWith('[log]:')) data[0] = data[0].substring(7)
        }
        originalConsole.timeLog('\x1b[0m          ', ...data)
    }

    function config() {
        process.stdout.write('\x1Bc')
        return cconsole
    }

    function enable() {
        console = newConsole
        return cconsole
    }

    function disable() {
        console = originalConsole
        return cconsole
    }

    return {
        config,
        enable,
        disable
    }
}

const cconsole = coloredConsole()

export default cconsole
