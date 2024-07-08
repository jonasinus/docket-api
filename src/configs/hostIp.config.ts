import os from 'node:os'

const networkInterfaces = os.networkInterfaces()

function getLocalIPv4() {
    for (const name of Object.keys(networkInterfaces)) {
        const addresses = networkInterfaces[name]
        if (addresses)
            for (const address of addresses) {
                if (address.family === 'IPv4' && !address.internal) {
                    return address.address
                }
            }
    }
}

const hostIp = getLocalIPv4()

export { hostIp }
