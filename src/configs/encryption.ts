const config: {
    iterations: number
    keyLength: number
    saltLength: number
    saltEnc: BufferEncoding
    digest: string
} = {
    iterations: 100000,
    keyLength: 64,
    saltLength: 32,
    saltEnc: 'hex',
    digest: 'sha512'
}

export default config
