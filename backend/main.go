package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"syscall/js"
	"time"

	"github.com/brianvoe/gofakeit/v6"
)

// Field represents a schema field configuration
type Field struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Options  map[string]interface{} `json:"options"`
}

// Schema represents the complete data generation schema
type Schema struct {
	Fields []Field `json:"fields"`
	Rows   int     `json:"rows"`
}

// DataGenerator handles concurrent data generation
type DataGenerator struct {
	faker *gofakeit.Faker
}

// NewDataGenerator creates a new data generator instance
func NewDataGenerator() *DataGenerator {
	return &DataGenerator{
		faker: gofakeit.New(time.Now().UnixNano()),
	}
}

// GenerateValue generates a single value based on field type and options
func (dg *DataGenerator) GenerateValue(field Field) string {
	switch field.Type {
	case "first_name":
		return dg.faker.FirstName()
	case "last_name":
		return dg.faker.LastName()
	case "full_name":
		return dg.faker.Name()
	case "email":
		return dg.faker.Email()
	case "phone":
		return dg.faker.Phone()
	case "address":
		return dg.faker.Address().Address
	case "city":
		return dg.faker.City()
	case "state":
		return dg.faker.State()
	case "country":
		return dg.faker.Country()
	case "zip_code":
		return dg.faker.Zip()
	case "company":
		return dg.faker.Company()
	case "job_title":
		return dg.faker.JobTitle()
	case "number":
		min := 1
		max := 100
		if minVal, ok := field.Options["min"].(float64); ok {
			min = int(minVal)
		}
		if maxVal, ok := field.Options["max"].(float64); ok {
			max = int(maxVal)
		}
		return strconv.Itoa(dg.faker.IntRange(min, max))
	case "decimal":
		min := 0.0
		max := 100.0
		if minVal, ok := field.Options["min"].(float64); ok {
			min = minVal
		}
		if maxVal, ok := field.Options["max"].(float64); ok {
			max = maxVal
		}
		return fmt.Sprintf("%.2f", dg.faker.Float64Range(min, max))
	case "boolean":
		return strconv.FormatBool(dg.faker.Bool())
	case "date":
		return dg.faker.Date().Format("2006-01-02")
	case "datetime":
		return dg.faker.Date().Format("2006-01-02 15:04:05")
	case "uuid":
		return dg.faker.UUID()
	case "username":
		return dg.faker.Username()
	case "password":
		return dg.faker.Password(true, true, true, true, false, 12)
	case "url":
		return dg.faker.URL()
	case "ip_address":
		return dg.faker.IPv4Address()
	case "credit_card":
		return dg.faker.CreditCardNumber(nil)
	case "color":
		return dg.faker.HexColor()
	case "lorem_ipsum":
		wordCount := 5
		if count, ok := field.Options["word_count"].(float64); ok {
			wordCount = int(count)
		}
		return dg.faker.LoremIpsumSentence(wordCount)
	case "custom_list":
		if values, ok := field.Options["values"].([]interface{}); ok && len(values) > 0 {
			idx := dg.faker.IntRange(0, len(values)-1)
			return fmt.Sprintf("%v", values[idx])
		}
		return "Custom Value"
	default:
		return dg.faker.Word()
	}
}

// GenerateRow generates a single row of data
func (dg *DataGenerator) GenerateRow(schema Schema) []string {
	row := make([]string, len(schema.Fields))
	for i, field := range schema.Fields {
		row[i] = dg.GenerateValue(field)
	}
	return row
}

// GenerateDataConcurrent generates data using multiple goroutines
func (dg *DataGenerator) GenerateDataConcurrent(schema Schema) [][]string {
	numWorkers := 4
	if schema.Rows < numWorkers {
		numWorkers = schema.Rows
	}
	
	rowsPerWorker := schema.Rows / numWorkers
	remainder := schema.Rows % numWorkers
	
	var wg sync.WaitGroup
	results := make([][]string, schema.Rows)
	
	startIdx := 0
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		
		workerRows := rowsPerWorker
		if i < remainder {
			workerRows++
		}
		
		go func(start, count int) {
			defer wg.Done()
			generator := NewDataGenerator()
			
			for j := 0; j < count; j++ {
				results[start+j] = generator.GenerateRow(schema)
			}
		}(startIdx, workerRows)
		
		startIdx += workerRows
	}
	
	wg.Wait()
	return results
}

// ConvertToCSV converts data to CSV format
func ConvertToCSV(schema Schema, data [][]string) string {
	var csvData strings.Builder
	writer := csv.NewWriter(&csvData)
	
	// Write headers
	headers := make([]string, len(schema.Fields))
	for i, field := range schema.Fields {
		headers[i] = field.Name
	}
	writer.Write(headers)
	
	// Write data rows
	for _, row := range data {
		writer.Write(row)
	}
	
	writer.Flush()
	return csvData.String()
}

// JavaScript bindings
func generateData(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return js.ValueOf("Error: Expected 1 argument (schema JSON)")
	}
	
	schemaJSON := args[0].String()
	var schema Schema
	
	if err := json.Unmarshal([]byte(schemaJSON), &schema); err != nil {
		return js.ValueOf(fmt.Sprintf("Error parsing schema: %v", err))
	}
	
	generator := NewDataGenerator()
	data := generator.GenerateDataConcurrent(schema)
	csvContent := ConvertToCSV(schema, data)
	
	return js.ValueOf(csvContent)
}

func getAvailableTypes(this js.Value, args []js.Value) interface{} {
	types := []map[string]interface{}{
		{"id": "first_name", "name": "First Name", "category": "Person"},
		{"id": "last_name", "name": "Last Name", "category": "Person"},
		{"id": "full_name", "name": "Full Name", "category": "Person"},
		{"id": "email", "name": "Email", "category": "Internet"},
		{"id": "phone", "name": "Phone", "category": "Person"},
		{"id": "address", "name": "Address", "category": "Location"},
		{"id": "city", "name": "City", "category": "Location"},
		{"id": "state", "name": "State", "category": "Location"},
		{"id": "country", "name": "Country", "category": "Location"},
		{"id": "zip_code", "name": "Zip Code", "category": "Location"},
		{"id": "company", "name": "Company", "category": "Business"},
		{"id": "job_title", "name": "Job Title", "category": "Business"},
		{"id": "number", "name": "Number", "category": "Numeric"},
		{"id": "decimal", "name": "Decimal", "category": "Numeric"},
		{"id": "boolean", "name": "Boolean", "category": "Misc"},
		{"id": "date", "name": "Date", "category": "Date/Time"},
		{"id": "datetime", "name": "Date Time", "category": "Date/Time"},
		{"id": "uuid", "name": "UUID", "category": "Misc"},
		{"id": "username", "name": "Username", "category": "Internet"},
		{"id": "password", "name": "Password", "category": "Internet"},
		{"id": "url", "name": "URL", "category": "Internet"},
		{"id": "ip_address", "name": "IP Address", "category": "Internet"},
		{"id": "credit_card", "name": "Credit Card", "category": "Finance"},
		{"id": "color", "name": "Color", "category": "Misc"},
		{"id": "lorem_ipsum", "name": "Lorem Ipsum", "category": "Text"},
		{"id": "custom_list", "name": "Custom List", "category": "Custom"},
	}
	
	typesJSON, _ := json.Marshal(types)
	return js.ValueOf(string(typesJSON))
}

func main() {
	// Set up JavaScript bindings
	js.Global().Set("generateData", js.FuncOf(generateData))
	js.Global().Set("getAvailableTypes", js.FuncOf(getAvailableTypes))
	
	// Keep the program running
	select {}
}