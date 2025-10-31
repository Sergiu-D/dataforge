import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Play, Settings, Database, Sparkles } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Field, DataType } from '../types/schema'
import { generateUniqueId } from '../utils/helpers'

interface SchemaBuilderProps {
  schema: Field[]
  setSchema: (schema: Field[]) => void
  rowCount: number
  setRowCount: (count: number) => void
  onGenerate: (data: string) => void
}

interface SortableFieldProps {
  field: Field
  onUpdate: (field: Field) => void
  onDelete: (id: string) => void
  dataTypes: DataType[]
}

const SortableField = ({ field, onUpdate, onDelete, dataTypes }: SortableFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [showOptions, setShowOptions] = useState(false)
  const selectedType = dataTypes.find(type => type.id === field.type)

  const handleFieldChange = (updates: Partial<Field>) => {
    onUpdate({ ...field, ...updates })
  }

  const handleOptionChange = (key: string, value: any) => {
    const newOptions = { ...field.options, [key]: value }
    handleFieldChange({ options: newOptions })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card-modern p-6 hover:scale-[1.02] transition-all duration-300 animate-scale-in"
    >
      <div className="flex items-center space-x-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing text-neutral-400 hover:text-primary-500 transition-colors duration-200 p-2 rounded-xl hover:bg-primary-50"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Field name"
            value={field.name}
            onChange={(e) => handleFieldChange({ name: e.target.value })}
            className="input-modern placeholder:text-neutral-400"
          />
          
          <select
            value={field.type}
            onChange={(e) => handleFieldChange({ type: e.target.value })}
            className="input-modern"
          >
            <option value="">Select type...</option>
            {Object.entries(
              dataTypes.reduce((acc, type) => {
                if (!acc[type.category]) acc[type.category] = []
                acc[type.category].push(type)
                return acc
              }, {} as Record<string, DataType[]>)
            ).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          
          <div className="flex items-center space-x-3">
            {selectedType?.hasOptions && (
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-3 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(field.id)}
              className="p-3 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {showOptions && selectedType?.hasOptions && (
        <div className="mt-6 p-4 glass-card rounded-xl animate-slide-down">
          <h4 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center space-x-2">
            <Settings className="h-4 w-4 text-primary-500" />
            <span>Field Options</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field.type === 'number' || field.type === 'decimal' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-2">Minimum Value</label>
                  <input
                    type="number"
                    value={field.options?.min || ''}
                    onChange={(e) => handleOptionChange('min', parseFloat(e.target.value) || 0)}
                    className="input-modern w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-2">Maximum Value</label>
                  <input
                    type="number"
                    value={field.options?.max || ''}
                    onChange={(e) => handleOptionChange('max', parseFloat(e.target.value) || 100)}
                    className="input-modern w-full text-sm"
                  />
                </div>
              </>
            ) : field.type === 'lorem_ipsum' ? (
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-2">Word Count</label>
                <input
                  type="number"
                  value={field.options?.word_count || 5}
                  onChange={(e) => handleOptionChange('word_count', parseInt(e.target.value) || 5)}
                  className="input-modern w-full text-sm"
                />
              </div>
            ) : field.type === 'custom_list' ? (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-2">Values (one per line)</label>
                <textarea
                  value={field.options?.values?.join('\n') || ''}
                  onChange={(e) => handleOptionChange('values', e.target.value.split('\n').filter(v => v.trim()))}
                  rows={4}
                  className="input-modern w-full text-sm resize-none"
                  placeholder="Value 1&#10;Value 2&#10;Value 3"
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

const SchemaBuilder = ({ schema, setSchema, rowCount, setRowCount, onGenerate }: SchemaBuilderProps) => {
  const [dataTypes, setDataTypes] = useState<DataType[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Load available data types from WASM
    const loadDataTypes = async () => {
      try {
        const { getAvailableTypesFromWasm } = await import('../utils/wasm')
        const types = await getAvailableTypesFromWasm()
        setDataTypes(types)
      } catch (error) {
        console.error('Failed to load data types:', error)
        // Fallback to default types
        const defaultTypes: DataType[] = [
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
        setDataTypes(defaultTypes)
      }
    }
    
    loadDataTypes()
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = schema.findIndex(field => field.id === active.id)
      const newIndex = schema.findIndex(field => field.id === over?.id)
      setSchema(arrayMove(schema, oldIndex, newIndex))
    }
  }

  const addField = () => {
    const newField: Field = {
      id: generateUniqueId(),
      name: `field_${schema.length + 1}`,
      type: '',
      options: {}
    }
    setSchema([...schema, newField])
  }

  const updateField = (updatedField: Field) => {
    setSchema(schema.map(field => 
      field.id === updatedField.id ? updatedField : field
    ))
  }

  const deleteField = (id: string) => {
    setSchema(schema.filter(field => field.id !== id))
  }

  const generateData = async () => {
    if (schema.length === 0) {
      alert('Please add at least one field to generate data')
      return
    }

    setIsGenerating(true)
    try {
      // Try to use WASM first, fallback to mock data
      let csvData: string
      try {
        const { generateDataWithWasm } = await import('../utils/wasm')
        const schemaData = { fields: schema }
        csvData = await generateDataWithWasm(schemaData, rowCount)
      } catch (wasmError) {
        console.warn('WASM generation failed, using fallback:', wasmError)
        csvData = generateMockCSV(schema, rowCount)
      }
      
      onGenerate(csvData)
    } catch (error) {
      console.error('Error generating data:', error)
      alert('Error generating data. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="card-modern p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Schema Builder</h2>
            <p className="text-sm text-neutral-600">Define your data structure</p>
          </div>
        </div>
        <button
          onClick={addField}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Field</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={schema.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 mb-8">
            {schema.map((field, index) => (
              <div key={field.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <SortableField
                  field={field}
                  onUpdate={updateField}
                  onDelete={deleteField}
                  dataTypes={dataTypes}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {schema.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-full blur-xl opacity-30 animate-pulse-soft"></div>
            <Database className="relative h-16 w-16 mx-auto mb-6 text-neutral-300" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">No fields added yet</h3>
          <p className="text-neutral-500 mb-6">Click "Add Field" to start building your schema</p>
          <button
            onClick={addField}
            className="btn-ghost inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Field</span>
          </button>
        </div>
      )}

      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-neutral-700">Rows:</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={rowCount}
                onChange={(e) => setRowCount(parseInt(e.target.value) || 100)}
                className="input-modern w-28 text-center"
              />
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-neutral-600">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <span>High-performance generation</span>
            </div>
          </div>
          
          <button
            onClick={generateData}
            disabled={isGenerating || schema.length === 0}
            className={`btn-accent flex items-center space-x-2 ${
              isGenerating ? 'animate-pulse-soft' : ''
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-soft`}
          >
            <Play className="h-4 w-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Data'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Temporary mock function - will be replaced with WASM
const generateMockCSV = (schema: Field[], rowCount: number): string => {
  const headers = schema.map(field => field.name).join(',')
  const rows = []
  
  for (let i = 0; i < rowCount; i++) {
    const row = schema.map(field => {
      switch (field.type) {
        case 'first_name': return `FirstName${i + 1}`
        case 'last_name': return `LastName${i + 1}`
        case 'email': return `user${i + 1}@example.com`
        case 'number': return Math.floor(Math.random() * 100).toString()
        default: return `Value${i + 1}`
      }
    }).join(',')
    rows.push(row)
  }
  
  return [headers, ...rows].join('\n')
}

export default SchemaBuilder