"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer } from "./ui/chart"

import { ChartTooltip, ChartTooltipContent } from "./ui/chart"

import { ChartLegend, ChartLegendContent } from "./ui/chart"

import { fetchMonthlyExpenses } from "../lib/firebase"

const chartData = [

]

// Brand-safe, accessible-ish fixed palette (20 colors)
const CATEGORY_COLOR_PALETTE = [
  "#2563eb", // blue-600
  "#f97316", // orange-500
  "#10b981", // emerald-500
  "#ef4444", // red-500
  "#a855f7", // purple-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#3b82f6", // blue-500
  "#e11d48", // rose-600
  "#22c55e", // green-500
  "#7c3aed", // violet-600
  "#06b6d4", // cyan-500
  "#d946ef", // fuchsia-500
  "#f43f5e", // rose-500
  "#84cc16", // lime-500
  "#8b5cf6", // violet-500
  "#0ea5e9", // sky-500
  "#fbbf24", // amber-400
  "#34d399", // emerald-400
  "#fb7185", // rose-400
]

type ExpensePoint = { month?: string; [key: string]: number | string | undefined }

export default function Component({ data: externalData }: { data?: ExpensePoint[] }) {
    const [data, setData] = useState<ExpensePoint[]>(() => externalData ?? chartData)

  useEffect(() => {
    if (externalData && Array.isArray(externalData)) return
    async function getData() {
      const expenses = await fetchMonthlyExpenses()
      setData(expenses)
    }
    getData()
    }, [externalData])

  // Derive categories dynamically from data (exclude 'month')
  const categories = useMemo(() => {
    if (!Array.isArray(data)) return [] as string[]
    const set = new Set<string>()
    for (const row of data) {
      for (const [key, value] of Object.entries(row || {})) {
        if (key === 'month') continue
        if (typeof value === 'number') set.add(key)
      }
    }
    return Array.from(set).sort()
  }, [data])

  // Map category names to a stable color from the theme palette --chart-1..5
  function colorIndexForCategory(cat: string) {
    let hash = 0
    for (let i = 0; i < cat.length; i++) {
      hash = ((hash << 5) - hash) + cat.charCodeAt(i)
      hash |= 0
    }
    return (Math.abs(hash) % 5) + 1
  }

  const dynamicChartConfig = useMemo(() => {
    // Only provide labels to avoid generating invalid CSS custom properties
    // for category names with spaces via ChartStyle.
    const cfg: Record<string, { label: string }> = {}
    categories.forEach(cat => {
      cfg[cat] = { label: cat }
    })
    return cfg
  }, [categories])

  function colorForCategory(cat: string) {
    let hash = 0
    for (let i = 0; i < cat.length; i++) {
      hash = ((hash << 5) - hash) + cat.charCodeAt(i)
      hash |= 0
    }
    const idx = Math.abs(hash) % CATEGORY_COLOR_PALETTE.length
    return CATEGORY_COLOR_PALETTE[idx]
  }

  // Ensure unique colors per category (up to palette size) with deterministic collision resolution
  const categoryColorMap = useMemo(() => {
    const used = new Set<number>()
    const map = new Map<string, string>()
    const sorted = [...categories]
    sorted.sort()
    for (const cat of sorted) {
      // preferred index by hash
      let preferredIndex = 0
      {
        let hash = 0
        for (let i = 0; i < cat.length; i++) {
          hash = ((hash << 5) - hash) + cat.charCodeAt(i)
          hash |= 0
        }
        preferredIndex = Math.abs(hash) % CATEGORY_COLOR_PALETTE.length
      }
      let assigned = -1
      for (let step = 0; step < CATEGORY_COLOR_PALETTE.length; step++) {
        const cand = (preferredIndex + step) % CATEGORY_COLOR_PALETTE.length
        if (!used.has(cand)) {
          assigned = cand
          used.add(cand)
          break
        }
      }
      if (assigned === -1) {
        // Fallback: palette exhausted; allow reuse of preferred
        assigned = preferredIndex
      }
      map.set(cat, CATEGORY_COLOR_PALETTE[assigned])
    }
    return map
  }, [categories])

  // Type helpers for JS-based chart UI components
  const TooltipContent: any = ChartTooltipContent
  const LegendContent: any = ChartLegendContent

    return (
        <ChartContainer id="expenses" config={dynamicChartConfig} className="min-h-[240px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value?.slice(0, 3)}
                />
                <ChartTooltip content={<TooltipContent />} />
                <ChartLegend content={<LegendContent />} />

        {categories.map(cat => (
          <Bar
            key={cat}
            dataKey={cat}
            fill={categoryColorMap.get(cat) || colorForCategory(cat)}
            radius={4}
          />
        ))}

            </BarChart>
        </ChartContainer>
    )
}
