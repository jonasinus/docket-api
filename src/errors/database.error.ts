class DatabaseError extends Error {
    err?: Error
    sql?: string
    params?: any[]

    constructor(message?: string, err?: any, sql?: string, params?: any[]) {
        super(message ?? err ?? 'generic DatabaseError')
        this.err = err
        this.sql = sql
        this.params = params
    }
}

export default DatabaseError
