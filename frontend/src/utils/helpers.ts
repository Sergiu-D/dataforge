export const generateUniqueId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export const downloadFile = (content: string, filename: string, mimeType: string) => {
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

export const parseCSV = (csvString: string): string[][] => {
  const lines = csvString.trim().split('\n')
  return lines.map(line => {
    // Simple CSV parsing - in production, use a proper CSV parser
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateSchema = (fields: any[]): string[] => {
  const errors: string[] = []
  
  if (fields.length === 0) {
    errors.push('At least one field is required')
  }
  
  fields.forEach((field, index) => {
    if (!field.name || field.name.trim() === '') {
      errors.push(`Field ${index + 1}: Name is required`)
    }
    
    if (!field.type || field.type.trim() === '') {
      errors.push(`Field ${index + 1}: Type is required`)
    }
    
    // Check for duplicate field names
    const duplicates = fields.filter(f => f.name === field.name)
    if (duplicates.length > 1) {
      errors.push(`Duplicate field name: "${field.name}"`)
    }
  })
  
  return [...new Set(errors)] // Remove duplicates
}