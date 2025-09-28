import React from "react"
import { Button } from "@/components/ui/button"
import Component from "@/components/Components"
import UploadExcel from "@/components/UploadExcel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchMonthlyExpenses } from "@/lib/firebase"
import "./App.css"

function App() {
  const [isDark, setIsDark] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState([])
  const [selectedMonth, setSelectedMonth] = React.useState('All')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [avgBasis, setAvgBasis] = React.useState('withData') // 'withData' | 'all'

  React.useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldDark = stored ? stored === 'dark' : prefersDark
    setIsDark(shouldDark)
    document.documentElement.classList.toggle('dark', shouldDark)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const expenses = await fetchMonthlyExpenses()
    setData(expenses)
    setLoading(false)
  }

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-md bg-primary" />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Personal Finance</span>
              <h1 className="text-xl font-semibold">Monthly Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UploadExcel onUploaded={loadData} />
            <Button variant="outline" onClick={toggleTheme}>{isDark ? 'Light mode' : 'Dark mode'}</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">Average basis</span>
          <Select value={avgBasis} onValueChange={setAvgBasis}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Average basis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="withData">Months with data</SelectItem>
              <SelectItem value="all">All months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Spend</CardTitle>
              <CardDescription>Sum of expenses this year</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-3xl font-semibold">{formatCurrency(getTotalSpend(data))}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avg / Month</CardTitle>
              <CardDescription>Average monthly spend</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-3xl font-semibold">{formatCurrency(getAveragePerMonth(data, avgBasis))}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Category</CardTitle>
              <CardDescription>Highest spend category</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-3xl font-semibold">{getTopCategory(data) || '—'}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted" />
              ) : (
                <Component data={applyFiltersToSeries(data, selectedMonth, selectedCategory)} />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Upload and review</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add widgets here: budget, goals, insights.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Filter by month and category</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Months</SelectItem>
                    {MONTHS.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {getAllCategories(data).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => {setSelectedMonth('All'); setSelectedCategory('All')}}>Reset</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : (
                <CategoriesTable data={data} selectedMonth={selectedMonth} selectedCategory={selectedCategory} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App

// Helpers and components local to App for simplicity
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function getTotalSpend(series) {
  if (!Array.isArray(series)) return 0
  return series.reduce((sum, row) => sum + sumCategories(row), 0)
}

function getAveragePerMonth(series, basis = 'withData') {
  if (!Array.isArray(series) || series.length === 0) return 0
  const total = getTotalSpend(series)
  if (basis === 'all') {
    const denom = Math.max(series.length, 1)
    return total / denom
  }
  const monthsWithData = series.filter(r => sumCategories(r) > 0).length
  const denom = Math.max(monthsWithData, 1)
  return total / denom
}

function getTopCategory(series) {
  const totals = {}
  for (const row of Array.isArray(series) ? series : []) {
    for (const [k, v] of Object.entries(row || {})) {
      if (k === 'month' || typeof v !== 'number') continue
      totals[k] = (totals[k] || 0) + v
    }
  }
  const top = Object.entries(totals).sort((a,b) => b[1]-a[1])[0]
  return top ? `${top[0]} (${formatCurrency(top[1])})` : null
}

function sumCategories(row) {
  if (!row || typeof row !== 'object') return 0
  return Object.entries(row).reduce((s,[k,v]) => k==='month'||typeof v!== 'number' ? s : s + v, 0)
}

function getAllCategories(series) {
  const set = new Set()
  for (const row of Array.isArray(series) ? series : []) {
    for (const [k, v] of Object.entries(row || {})) {
      if (k === 'month' || typeof v !== 'number') continue
      set.add(k)
    }
  }
  return Array.from(set).sort()
}

function applyFiltersToSeries(series, month, category) {
  const filterMonth = month && month !== 'All' ? month : null
  const filterCategory = category && category !== 'All' ? category : null
  if (!filterMonth && !filterCategory) return series
  return series.map(row => {
    if (!row) return row
    if (filterMonth && row.month !== filterMonth) return row
    if (!filterCategory) return row
    // keep other fields but zero-out other categories for chart clarity
    const next = { ...row }
    for (const key of Object.keys(next)) {
      if (key === 'month') continue
      if (typeof next[key] === 'number' && key !== filterCategory) {
        next[key] = 0
      }
    }
    return next
  })
}

function CategoriesTable({ data, selectedMonth, selectedCategory }) {
  const rows = buildCategoryRows(data, selectedMonth, selectedCategory)
  if (!rows.length) {
    return <div className="text-sm text-muted-foreground">No data to display.</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 font-medium">Category</th>
            {MONTHS.map(m => (
              <th key={m} className="py-2 text-right font-medium hidden md:table-cell">{m.slice(0,3)}</th>
            ))}
            <th className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.category} className="border-b last:border-0">
              <td className="py-2">{r.category}</td>
              {MONTHS.map(m => (
                <td key={m} className="py-2 text-right hidden md:table-cell">{r.byMonth[m] ? formatCurrency(r.byMonth[m]) : '—'}</td>
              ))}
              <td className="py-2 text-right font-medium">{formatCurrency(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function buildCategoryRows(series, selectedMonth, selectedCategory) {
  const filterMonth = selectedMonth && selectedMonth !== 'All' ? selectedMonth : null
  const filterCategory = selectedCategory && selectedCategory !== 'All' ? selectedCategory : null
  const totals = new Map()
  for (const row of Array.isArray(series) ? series : []) {
    if (filterMonth && row.month !== filterMonth) continue
    for (const [k,v] of Object.entries(row || {})) {
      if (k === 'month' || typeof v !== 'number') continue
      if (filterCategory && k !== filterCategory) continue
      if (!totals.has(k)) totals.set(k, { category: k, total: 0, byMonth: Object.fromEntries(MONTHS.map(m => [m, 0])) })
      const entry = totals.get(k)
      entry.total += v
      entry.byMonth[row.month] = (entry.byMonth[row.month] || 0) + v
    }
  }
  return Array.from(totals.values()).sort((a,b) => b.total - a.total)
}