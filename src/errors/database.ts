class DatabaseError extends Error {
    sql: string
    params: any[]
    error: any
    constructor(error: any, message: any, sql = '', params: any[] = []) {
        super(error)
        this.error = 'error'
        this.name = 'DatabaseError'
        this.sql = sql
        this.params = params
    }
}

export default DatabaseError
