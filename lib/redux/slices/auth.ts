"use client"

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

type User = { id: string; name: string; email: string; role: "admin" | "editor" | "viewer"; active: boolean }
type AuthState = {
  user: User | null
  token: string | null
  status: "idle" | "loading" | "error"
  error?: string
  locale: "ar" | "en"
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  locale: "ar",
}

export const login = createAsyncThunk("auth/login", async (payload: { email: string; password: string }) => {
  const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error("Login failed")
  return (await res.json()) as { user: User; token: string }
})

export const register = createAsyncThunk("auth/register", async (payload: { name: string; email: string; password: string }) => {
  const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error("Register failed")
  return (await res.json()) as { user: User; token: string }
})

export const me = createAsyncThunk("auth/me", async () => {
  const res = await fetch("/api/auth/me")
  if (!res.ok) throw new Error("Unauthenticated")
  return (await res.json()) as { user: User }
})

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
    },
    setLocale(state, action: PayloadAction<"ar" | "en">) {
      state.locale = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (s) => { s.status = "loading"; s.error = undefined })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "idle"; s.user = a.payload.user; s.token = a.payload.token
      })
      .addCase(login.rejected, (s, a) => { s.status = "error"; s.error = a.error.message })
      .addCase(register.pending, (s) => { s.status = "loading"; s.error = undefined })
      .addCase(register.fulfilled, (s, a) => {
        s.status = "idle"; s.user = a.payload.user; s.token = a.payload.token
      })
      .addCase(register.rejected, (s, a) => { s.status = "error"; s.error = a.error.message })
      .addCase(me.fulfilled, (s, a) => { s.user = a.payload.user })
  },
})

export const { logout, setLocale } = auth.actions
export default auth.reducer
export type { User }
