"use client"

import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux"
import users from "./slices/users"
import content from "./slices/content"
import analytics from "./slices/analytics"
import ui from "./slices/ui"

const rootReducer = combineReducers({
  ui,
  users,
  content,
  analytics,
})

function loadState() {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem("dashboard_state")
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
})

if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      localStorage.setItem("dashboard_state", JSON.stringify(store.getState()))
    } catch {}
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
