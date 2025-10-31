// WebAssembly loader and interface
declare global {
  interface Window {
    Go: any
    generateData: (schemaJSON: string) => string
    getAvailableTypes: () => string
  }
}

let wasmInitialized = false
let wasmInstance: WebAssembly.Instance | null = null

export const initializeWasm = async (): Promise<boolean> => {
  if (wasmInitialized) return true

  try {
    // Load the Go WebAssembly support script
    if (!window.Go) {
      await loadScript('/wasm_exec.js')
    }

    // Initialize Go runtime
    const go = new window.Go()
    
    // Load and instantiate the WebAssembly module
    const wasmResponse = await fetch('/main.wasm')
    const wasmBytes = await wasmResponse.arrayBuffer()
    const wasmModule = await WebAssembly.instantiate(wasmBytes, go.importObject)
    
    wasmInstance = wasmModule.instance
    
    // Run the Go program
    go.run(wasmInstance)
    
    wasmInitialized = true
    console.log('WebAssembly initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize WebAssembly:', error)
    return false
  }
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export const generateDataWithWasm = async (schema: any, rowCount: number): Promise<string> => {
  if (!wasmInitialized) {
    const initialized = await initializeWasm()
    if (!initialized) {
      throw new Error('WebAssembly not available, falling back to mock data')
    }
  }

  try {
    const schemaWithRows = { ...schema, rows: rowCount }
    const schemaJSON = JSON.stringify(schemaWithRows)
    
    if (window.generateData) {
      return window.generateData(schemaJSON)
    } else {
      throw new Error('generateData function not available')
    }
  } catch (error) {
    console.error('WASM generation failed:', error)
    throw error
  }
}

export const getAvailableTypesFromWasm = async (): Promise<any[]> => {
  if (!wasmInitialized) {
    const initialized = await initializeWasm()
    if (!initialized) {
      return getDefaultDataTypes()
    }
  }

  try {
    if (window.getAvailableTypes) {
      const typesJSON = window.getAvailableTypes()
      return JSON.parse(typesJSON)
    } else {
      return getDefaultDataTypes()
    }
  } catch (error) {
    console.error('Failed to get types from WASM:', error)
    return getDefaultDataTypes()
  }
}

// Fallback data types when WASM is not available
const getDefaultDataTypes = () => [
  { id: 'first_name', name: 'First Name', category: 'Person' },
  { id: 'last_name', name: 'Last Name', category: 'Person' },
  { id: 'full_name', name: 'Full Name', category: 'Person' },
  { id: 'email', name: 'Email', category: 'Internet' },
  { id: 'phone', name: 'Phone', category: 'Person' },
  { id: 'address', name: 'Address', category: 'Location' },
  { id: 'city', name: 'City', category: 'Location' },
  { id: 'state', name: 'State', category: 'Location' },
  { id: 'country', name: 'Country', category: 'Location' },
  { id: 'zip_code', name: 'Zip Code', category: 'Location' },
  { id: 'company', name: 'Company', category: 'Business' },
  { id: 'job_title', name: 'Job Title', category: 'Business' },
  { id: 'number', name: 'Number', category: 'Numeric', hasOptions: true },
  { id: 'decimal', name: 'Decimal', category: 'Numeric', hasOptions: true },
  { id: 'boolean', name: 'Boolean', category: 'Misc' },
  { id: 'date', name: 'Date', category: 'Date/Time' },
  { id: 'datetime', name: 'Date Time', category: 'Date/Time' },
  { id: 'uuid', name: 'UUID', category: 'Misc' },
  { id: 'username', name: 'Username', category: 'Internet' },
  { id: 'password', name: 'Password', category: 'Internet' },
  { id: 'url', name: 'URL', category: 'Internet' },
  { id: 'ip_address', name: 'IP Address', category: 'Internet' },
  { id: 'credit_card', name: 'Credit Card', category: 'Finance' },
  { id: 'color', name: 'Color', category: 'Misc' },
  { id: 'lorem_ipsum', name: 'Lorem Ipsum', category: 'Text', hasOptions: true },
  { id: 'custom_list', name: 'Custom List', category: 'Custom', hasOptions: true },
]

export const isWasmSupported = (): boolean => {
  return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function'
}