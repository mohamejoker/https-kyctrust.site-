"use client"

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type Point = { t: string; v: number }
type AnalyticsState = {
  kpis: { title: string; value: string; delta?: string }[]
  series: Point[]
}

const initialState: AnalyticsState = {
  kpis: [
    { title: "Visitors", value: "12,430", delta: "+8%" },
    { title: "Leads", value: "742", delta: "+3%" },
    { title: "Orders", value: "341", delta: "+5%" },
    { title: "Conv. Rate", value: "2.7%", delta: "+0.2%" },
  ],
  series: Array.from({ length: 14 }).map((_, i) => ({ t: `D${i + 1}`, v: Math.round(40 + Math.random() * 60) })),
}

const analytics = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setKpis(state, action: PayloadAction<AnalyticsState["kpis"]>) {
      state.kpis = action.payload
    },
    setSeries(state, action: PayloadAction<AnalyticsState["series"]>) {
      state.series = action.payload
    },
  },
})

export const { setKpis, setSeries } = analytics.actions
export default analytics.reducer
