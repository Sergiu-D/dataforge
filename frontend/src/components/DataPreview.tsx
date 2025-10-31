import { useState } from 'react'
import { Download, Eye, Code, FileText, Sparkles } from 'lucide-react'
import type { Field } from '../types/schema'

interface DataPreviewProps {
  data: string
  schema: Field[]
}

type ViewMode = 'table' | 'csv' | 'json'

const DataPreview = ({ data }: DataPreviewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showAll, setShowAll] = useState(false)

  const parseCSVData = (csvData: string) => {
    if (!csvData) return { headers: [], rows: [] }
    
    const lines = csvData.trim().split('\n')
    const headers = lines[0]?.split(',') || []
    const rows = lines.slice(1).map(line => line.split(','))
    
    return { headers, rows }
  }

  const convertToJSON = (csvData: string) => {
    const { headers, rows } = parseCSVData(csvData)
    return rows.map(row => {
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] || ''
      })
      return obj
    })
  }

  const downloadData = (format: 'csv' | 'json') => {
    if (!data) return

    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'csv') {
      content = data
      filename = 'generated_data.csv'
      mimeType = 'text/csv'
    } else {
      content = JSON.stringify(convertToJSON(data), null, 2)
      filename = 'generated_data.json'
      mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const { headers, rows } = parseCSVData(data)
  const displayRows = showAll ? rows : rows.slice(0, 10)

  if (!data) {
    return (
      <div className="card-modern p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Data Preview</h2>
            <p className="text-sm text-neutral-600">No data generated yet</p>
          </div>
        </div>
        <div className="text-center py-16 text-neutral-500">
          <div className="relative">
            <FileText className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
            <div className="absolute -top-2 -right-2 p-1 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-lg font-medium mb-2">Ready to Generate Data</p>
          <p className="text-neutral-400">Configure your schema and click "Generate Data" to see results.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-modern p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Data Preview</h2>
            <p className="text-sm text-neutral-600 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <span>{rows.length} rows generated successfully</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'table'
                  ? 'bg-white text-primary-600 shadow-sm font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('csv')}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'csv'
                  ? 'bg-white text-primary-600 shadow-sm font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'json'
                  ? 'bg-white text-primary-600 shadow-sm font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <Code className="h-4 w-4" />
              <span>JSON</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => downloadData('csv')}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => downloadData('json')}
              className="btn-success flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {displayRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`transition-colors duration-150 ${
                    rowIndex % 2 === 0 ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-25 hover:bg-neutral-75'
                  }`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 text-sm text-neutral-900 max-w-xs truncate font-medium"
                        title={cell}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'csv' && (
          <div className="p-6">
            <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-mono bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 rounded-lg overflow-x-auto border border-neutral-200">
              {showAll ? data : data.split('\n').slice(0, 11).join('\n')}
            </pre>
          </div>
        )}

        {viewMode === 'json' && (
          <div className="p-6">
            <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-mono bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 rounded-lg overflow-x-auto border border-neutral-200">
              {JSON.stringify(
                showAll ? convertToJSON(data) : convertToJSON(data).slice(0, 10),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {rows.length > 10 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-primary-50"
          >
            {showAll ? 'Show Less' : `Show All ${rows.length} Rows`}
          </button>
        </div>
      )}

      <div className="mt-6 text-sm text-neutral-500 text-center bg-neutral-50 rounded-lg p-3">
        <span className="font-medium">Generated {rows.length} rows</span> with <span className="font-medium">{headers.length} fields</span>
      </div>
    </div>
  )
}

export default DataPreview