import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { usersFile as usersFilePath, fileEnc, userFile } from '../config/files'
import { join } from 'path'

type User = {
    name: string
    password: string
}

function getAllUsers(): User[] {
    try {
        const data = readFileSync(usersFilePath, 'utf8')
        return JSON.parse(data)
    } catch (err) {
        // Handle potential errors like file not found gracefully
        //@ts-ignore
        if (err.code === 'ENOENT') {
            return [] // Return empty array if file doesn't exist
        } else {
            throw err
        }
    }
}

function addUser(user: User): void {
    const users = getAllUsers()
    users.push(user)
    writeFileSync(usersFilePath, JSON.stringify(users, null, 4))
    const userFolder = userFile(user.name)

    mkdirSync(userFolder, { recursive: true })
    mkdirSync(join(userFolder, 'documents'))
    mkdirSync(join(userFolder, 'files'))
    mkdirSync(join(userFolder, 'inventory'))
    mkdirSync(join(userFolder, 'fincance'))
    writeFileSync(join(userFolder, 'people.json'), '[]')
    writeFileSync(join(userFolder, 'keys'), '{}')
}

function deleteUser(name: string): void {
    const users = getAllUsers()
    const filteredUsers = users.filter((user) => user.name !== name)
    writeFileSync(usersFilePath, JSON.stringify(filteredUsers, null, 4))
}

// No changes needed for findUserBy as it only reads data
function findUserBy({ name }: { name: string }): User | undefined {
    const users = getAllUsers()
    return users.find((user) => user.name === name)
}

export type { User }
export const UserController = { getAllUsers, addUser, deleteUser, findUserBy }
