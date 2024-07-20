import DatabaseError from '@error/database.error'
import { createPool, FieldPacket, OkPacketParams, Pool, PoolConnection, RowDataPacket, QueryResult, OkPacket, ResultSetHeader } from 'mysql2/promise'

const Database = IDatabase()

function IDatabase() {
    const DB_Credentials: DB_Credentials = {}
    const runntime: DB_Runntime = {
        pool: null
    }

    function config({ host, database, password, user, port }: Omit<DB_Credentials, 'port'> & { port?: string }) {
        console.info('[info]: configuring database')
        DB_Credentials.host = host
        DB_Credentials.database = database
        DB_Credentials.password = password
        DB_Credentials.user = user
        DB_Credentials.port = parseInt(port || '3306')
        console.info('[info]: database configured')
        return Database
    }

    async function connect() {
        try {
            console.info('[info]: opening database')
            const pool = createPool({ ...DB_Credentials })
            runntime.pool = pool
            console.info('[info]: database ready')
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async function getOne<T>(sql: string, params?: any[]): Promise<T | null> {
        try {
            if (runntime.pool == undefined) throw new DatabaseError('Database must be initialized before use!')
            const connection: PoolConnection = await runntime.pool!.getConnection()
            connection.release()
            const [result]: [RowDataPacket[], FieldPacket[]] = await connection.query(sql, params)
            return (result[0] as T) ?? null
        } catch (err) {
            throw err
        }
    }

    async function getAll<T>(sql: string, params?: any[]): Promise<T[]> {
        try {
            if (runntime.pool == undefined) throw new DatabaseError('Database must be initialized before use!')
            const connection: PoolConnection = await runntime.pool!.getConnection()
            connection.release()
            const [result]: [RowDataPacket[], FieldPacket[]] = await connection.query(sql, params)
            return (result as T[]) ?? []
        } catch (err) {
            throw err
        }
    }

    async function runOnce(sql: string, params?: any[]) {
        try {
            if (runntime.pool == undefined) throw new DatabaseError('Database must be initialized before use!')
            const connection: PoolConnection = await runntime.pool!.getConnection()
            const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(sql, params)
            connection.release()
            return result
        } catch (err) {
            throw err
        }
    }

    async function restart() {
        console.info('[info]: restarting database')
        if (runntime.pool) await runntime.pool.end()
        runntime.pool = null
        await connect()
        console.info('[info]: database restarted')
    }

    async function disconnect() {
        console.info('[info]: closing database, all information remaines safed')
        if (runntime.pool) await runntime.pool.end()
        runntime.pool = null
        console.info('[info]: database closed')
    }

    return {
        config,
        connect,
        getOne,
        getAll,
        runOnce,
        restart,
        disconnect
    }
}

type DB_Credentials = {
    port?: number
    host?: string
    database?: string
    password?: string
    user?: string
}

type DB_Runntime = {
    pool: Pool | null
}

interface Database {
    config: ({ host, database, password, user, port }: Omit<DB_Credentials, 'port'> & { port?: string }) => Database
    connect: () => Promise<void>
    getOne: <T>(sql: string, params?: any[]) => Promise<T | null>
    getAll: <T>(sql: string, params?: any[]) => Promise<T[]>
    runOnce: (sql: string, params?: any[]) => Promise<ResultSetHeader>
    restart: () => Promise<void>
    disconnect: () => Promise<void>
}

export type { DB_Credentials }
export default Database
