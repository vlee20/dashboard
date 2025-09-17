import React, { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { uploadMonthlyExpenses } from "@/lib/firebase"

export default function UploadExcel() {
  const inputRef = useRef(null)
  const [status, setStatus] = useState("")

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus("Parsing file...")
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const monthMap = {}

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName]
        if (!ws) return
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null })
        // rows: array of objects. Expect keys like 'Category' and 'Expense'
        const categories = {}
        rows.forEach((row) => {
          // find keys case-insensitively
          const keys = Object.keys(row || {})
          if (keys.length === 0) return
          const catKey = keys.find(k => k.toLowerCase().includes("category")) || keys[0]
          const valKey = keys.find(k => k.toLowerCase().includes("expense") || k.toLowerCase().includes("amount")) || keys[1] || keys[0]
          const cat = String(row[catKey] ?? "").trim()
          const val = Number(row[valKey]) || 0
          if (!cat) return
          categories[cat] = (categories[cat] || 0) + val
        })
        // only add if we found categories
        if (Object.keys(categories).length > 0) {
          monthMap[sheetName] = categories
        }
      })

      setStatus("Uploading to Firebase...")
      const res = await uploadMonthlyExpenses(monthMap)
      if (res.success) {
        setStatus("Upload complete")
      } else {
        setStatus("Upload failed")
        console.error(res.error)
      }
    } catch (err) {
      console.error(err)
      setStatus("Error parsing or uploading file")
    } finally {
      // reset input so same file can be reselected
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onFile}
        style={{ display: "none" }}
      />
      <button
        onClick={() => inputRef.current && inputRef.current.click()}
        className="btn"
      >
        Upload Excel
      </button>
      <span>{status}</span>
    </div>
  )
}