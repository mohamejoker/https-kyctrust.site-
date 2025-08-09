"use client"

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type UIState = {
  locale: "ar" | "en"
}

const initialState: UIState = {
  locale: "ar",
}

const ui = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<"ar" | "en">) {
      state.locale = action.payload
    },
  },
})

export const { setLocale } = ui.actions
export default ui.reducer
