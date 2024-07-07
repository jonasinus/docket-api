import { createConnection, Connection, createPool, Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import DatabaseError from '@error/database'

const db = IDatabase()

function Database() {
    return db
}

interface Database {
    runOne: (sql: string, params: any[]) => Promise<ResultSetHeader>
    getAll: (sql: string, params: any[]) => Promise<RowDataPacket[]>
    getOne: (sql: string, params: any[]) => Promise<RowDataPacket>
}

async function IDatabase(): Promise<Database> {
    const credentials = {
        host: process.env.DBHOST || 'localhost',
        database: process.env.DBDATABASE || 'docket',
        user: process.env.DBUN || 'root',
        password: process.env.DBPW || 'hallo',
        port: parseInt(process.env.DBPORT || '3306')
    }

    function createConnectionPool(credentials: { host: string; database: string; user: string; password: string; port: number }) {
        return createPool({
            host: credentials.host,
            database: credentials.database,
            port: credentials.port,
            user: credentials.user,
            password: credentials.password
        })
    }

    const pool: Pool = createConnectionPool(credentials)

    async function query(sql: string, params: any[]) {
        try {
            const connection: PoolConnection = await pool.getConnection()
            const [rows] = await connection.query(sql, params)
            pool.releaseConnection(connection)
            return rows
        } catch (err) {
            throw new DatabaseError(err, 'error querying database', sql, params)
        }
    }

    async function getOne(sql: string, params: any[]): Promise<RowDataPacket> {
        try {
            const connection: PoolConnection = await pool.getConnection()
            const [rows] = await connection.query(sql, params)
            const firstRow = (rows as RowDataPacket)[0]
            return firstRow as RowDataPacket
        } catch (err) {
            throw new DatabaseError(err, 'error querying database', sql, params)
        }
    }

    async function getAll(sql: string, params: any[]): Promise<RowDataPacket[]> {
        try {
            const connection: PoolConnection = await pool.getConnection()
            const [rows] = await connection.query(sql, params)
            console.log(rows)
            return rows as RowDataPacket[]
        } catch (err) {
            throw new DatabaseError(err, 'error querying database', sql, params)
        }
    }

    async function runOne(sql: string, params: any[]): Promise<ResultSetHeader> {
        try {
            const connection: PoolConnection = await pool.getConnection()
            const [result] = await connection.query(sql, params)
            return result as ResultSetHeader
        } catch (err) {
            throw new DatabaseError(err, 'error running query', sql, params)
        }
    }

    async function panic() {
        await pool.end()
    }

    return {
        // query,
        // panic,
        getOne,
        getAll,
        runOne
    }
}

export default Database
