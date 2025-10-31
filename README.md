# DataForge

A powerful client-side web application for generating realistic test data. Built with React 18, TypeScript, Tailwind CSS, and Go WebAssembly for high-performance data generation.

## Features

- 🎯 **Schema Builder**: Intuitive drag-and-drop interface for creating data schemas
- 🚀 **High Performance**: Go WebAssembly backend with concurrent data generation
- 🔒 **Client-Side Only**: Complete privacy - no data leaves your browser
- 📊 **25+ Data Types**: Comprehensive set of realistic data generators
- 📁 **Multiple Export Formats**: CSV and JSON export with instant download
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-Time Preview**: Instant data preview as you build your schema

## Supported Data Types

### Person
- First Name, Last Name, Full Name
- Email, Phone, Username, Password

### Location
- Address, City, State, Country, Zip Code

### Business
- Company, Job Title

### Internet
- Email, URL, IP Address, Username, Password

### Numeric
- Number (with min/max range)
- Decimal (with precision control)

### Date/Time
- Date, DateTime

### Finance
- Credit Card Number

### Miscellaneous
- Boolean, UUID, Color, Lorem Ipsum

### Custom
- Custom List (user-defined values)

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **@dnd-kit** for drag-and-drop functionality
- **Lucide React** for icons

### Backend
- **Go 1.21** compiled to WebAssembly
- **gofakeit** library for realistic data generation
- Concurrent processing with goroutines

### Deployment
- **GitHub Pages** hosting
- **GitHub Actions** CI/CD pipeline
- Automated Go to WASM compilation

## Getting Started

### Prerequisites
- Node.js 18+ 
- Go 1.21+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dataforge
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Go dependencies**
   ```bash
   cd ../backend
   go mod download
   ```

4. **Build Go to WebAssembly**
   ```bash
   GOOS=js GOARCH=wasm go build -o ../frontend/public/main.wasm main.go
   cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ../frontend/public/
   ```

5. **Start the development server**
   ```bash
   cd ../frontend
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
# Build WebAssembly
cd backend
GOOS=js GOARCH=wasm go build -o ../frontend/public/main.wasm main.go
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ../frontend/public/

# Build frontend
cd ../frontend
npm run build
```

## Project Structure

```
dataforge/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions and WASM loader
│   │   └── App.tsx         # Main application component
│   ├── public/             # Static assets and WASM files
│   └── package.json        # Frontend dependencies
├── backend/                 # Go WebAssembly backend
│   ├── main.go             # Main Go application
│   └── go.mod              # Go module definition
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment workflow
└── README.md
```

## Usage

1. **Add Fields**: Click "Add Field" to create new data fields
2. **Configure Types**: Select data types from the dropdown menu
3. **Set Options**: Configure field-specific options (ranges, word counts, etc.)
4. **Reorder Fields**: Drag and drop fields to reorder them
5. **Set Row Count**: Specify how many rows of data to generate
6. **Generate Data**: Click "Generate Data" to create your dataset
7. **Preview & Export**: View data in table/CSV/JSON format and download

## Performance

- **Concurrent Generation**: Utilizes Go goroutines for parallel data generation
- **WebAssembly Speed**: Near-native performance in the browser
- **Memory Efficient**: Streaming data generation for large datasets
- **Client-Side Processing**: No server round-trips, instant generation

## Browser Compatibility

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

WebAssembly support is required for optimal performance.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Mockaroo](https://mockaroo.com/)
- Built with [gofakeit](https://github.com/brianvoe/gofakeit) for realistic data generation
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons provided by [Lucide](https://lucide.dev/)