import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import Component from "@/components/Components"
import UploadExcel from "@/components/UploadExcel"
import "./App.css"

function App() {
  const [date, setDate] = useState(new Date())

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <Button>Click me</Button>
        <UploadExcel />
      </div>
      <div>test</div>
      <div>
        <Calendar 
          mode="single"
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
          className="rounded-lg border"/>
      </div>
      <div>
        <Component />
      </div>
    </>
  )
}

export default App