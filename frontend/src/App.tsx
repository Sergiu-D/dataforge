import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import SchemaBuilder from './components/SchemaBuilder'
import DataPreview from './components/DataPreview'
import type { Field } from './types/schema'

function App() {
  const [schema, setSchema] = useState<Field[]>([])
  const [rowCount, setRowCount] = useState(100)
  const [generatedData, setGeneratedData] = useState<string>('')

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
                  <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <SchemaBuilder 
                      schema={schema}
                      setSchema={setSchema}
                      rowCount={rowCount}
                      setRowCount={setRowCount}
                      onGenerate={setGeneratedData}
                    />
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <DataPreview 
                      data={generatedData}
                      schema={schema}
                    />
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
