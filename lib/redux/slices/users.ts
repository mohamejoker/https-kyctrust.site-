"use client"

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import type { User } from "./auth"

type UsersState = {
  items: User[]
  status: "idle" | "loading" | "error"
  error?: string
}

const initialState: UsersState = {
  items: [],
  status: "idle",
}

export const fetchUsers = createAsyncThunk("users/fetch", async () => {
  const res = await fetch("/api/users")
  if (!res.ok) throw new Error("Failed to fetch users")
  return (await res.json()) as User[]
})

export const createUser = createAsyncThunk("users/create", async (user: Omit<User, "id">) => {
  const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) })
  if (!res.ok) throw new Error("Failed to create user")
  return (await res.json()) as User
})

export const updateUser = createAsyncThunk("users/update", async (user: User) => {
  const res = await fetch(`/api/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) })
  if (!res.ok) throw new Error("Failed to update user")
  return (await res.json()) as User
})

export const deleteUser = createAsyncThunk("users/delete", async (id: string) => {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete user")
  return id
})

const users = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (s) => { s.status = "loading"; s.error = undefined })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.status = "idle"; s.items = a.payload })
      .addCase(fetchUsers.rejected, (s, a) => { s.status = "error"; s.error = a.error.message })
      .addCase(createUser.fulfilled, (s, a) => { s.items.push(a.payload) })
      .addCase(updateUser.fulfilled, (s, a) => {
        const i = s.items.findIndex((u) => u.id === a.payload.id); if (i >= 0) s.items[i] = a.payload
      })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.items = s.items.filter((u) => u.id !== a.payload)
      })
  },
})

export default users.reducer
