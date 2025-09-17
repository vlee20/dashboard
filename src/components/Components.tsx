"use client"

import React, { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"

import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"

import { fetchMonthlyExpenses } from "@/lib/firebase"

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
} satisfies ChartConfig

export default function Component() {
    const [data, setData] = useState(() => chartData)

  useEffect(() => {
    async function getData() {
      const expenses = await fetchMonthlyExpenses()
      console.log('Fetched expenses inside useEffect:', expenses)
      setData(expenses)
    }
    getData()
    }, [])

  // Detect whether each series exists in the fetched data
  const hasFood = Array.isArray(data) && data.some(d => d && d.Food != null)
  const hasFun = Array.isArray(data) && data.some(d => d && d.Fun != null)
  const hasCharging = Array.isArray(data) && data.some(d => d && d.Charging != null)

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value?.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />

        {hasFood && <Bar dataKey="Food" fill="var(--color-Food)" radius={4} />}
        {hasFun && <Bar dataKey="Fun" fill="var(--color-Fun)" radius={4} />}
        {hasCharging && <Bar dataKey="Charging" fill="var(--color-Charging)" radius={4} />}

            </BarChart>
        </ChartContainer>
    )
}
