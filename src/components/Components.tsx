"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer } from "./ui/chart"

import { ChartTooltip, ChartTooltipContent } from "./ui/chart"

import { ChartLegend, ChartLegendContent } from "./ui/chart"

import { fetchMonthlyExpenses } from "../lib/firebase"

const chartData = [

]

const chartConfig = {
	Food: {
		label: "Food",
		color: "#2563eb",
	},
  Fun: {
    label: "Fun",
    color: "#f97316",
  },
  Charging: {
    label: "Charging",
    color: "#10b981",
  },
}

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

  // Detect whether each series exists in the fetched data
  const hasFood = Array.isArray(data) && data.some(d => d && d.Food != null)
  const hasFun = Array.isArray(data) && data.some(d => d && d.Fun != null)
  const hasCharging = Array.isArray(data) && data.some(d => d && d.Charging != null)

  // Type helpers for JS-based chart UI components
  const TooltipContent: any = ChartTooltipContent
  const LegendContent: any = ChartLegendContent

    return (
        <ChartContainer id="expenses" config={chartConfig} className="min-h-[240px] w-full">
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

        {hasFood && <Bar dataKey="Food" fill="var(--color-Food)" radius={4} />}
        {hasFun && <Bar dataKey="Fun" fill="var(--color-Fun)" radius={4} />}
        {hasCharging && <Bar dataKey="Charging" fill="var(--color-Charging)" radius={4} />}

            </BarChart>
        </ChartContainer>
    )
}
