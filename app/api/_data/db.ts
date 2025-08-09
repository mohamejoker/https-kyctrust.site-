export type DBUser = {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  active: boolean
}

type DB = {
  users: DBUser[]
}

export const db: DB = {
  users: [
    { id: "1", name: "Admin", email: "admin@example.com", role: "admin", active: true },
  ],
}

export const findUserByEmail = (email: string) => db.users.find((u) => u.email === email)
export const findUserById = (id: string) => db.users.find((u) => u.id === id)

export const addUser = (u: Omit<DBUser, "id">) => {
  const user: DBUser = { id: String(Date.now()), ...u }
  db.users.push(user)
  return user
}

export const updateUser = (id: string, patch: Partial<DBUser>) => {
  const idx = db.users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  db.users[idx] = { ...db.users[idx], ...patch }
  return db.users[idx]
}

export const deleteUser = (id: string) => {
  const before = db.users.length
  const next = db.users.filter((u) => u.id !== id)
  const removed = next.length !== before
  if (removed) {
    db.users.splice(0, db.users.length, ...next)
  }
  return removed
}
