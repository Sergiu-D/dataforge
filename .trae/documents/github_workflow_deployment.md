# GitHub Actions Deployment Workflow

## Overview

This document describes the GitHub Actions workflow for building and deploying the MockData Generator to GitHub Pages. The workflow compiles the Go application to WebAssembly, builds the React frontend, and deploys the combined application.

## Workflow Configuration

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Install frontend dependencies
      working-directory: ./frontend
      run: npm ci

    - name: Build Go WebAssembly
      working-directory: ./backend
      run: |
        GOOS=js GOARCH=wasm go build -o ../frontend/public/main.wasm main.go
        cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ../frontend/public/

    - name: Build React application
      working-directory: ./frontend
      run: |
        npm run build
        
    - name: Setup Pages
      uses: actions/configure-pages@v3
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v2
      with:
        path: './frontend/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v2
```

## Project Structure

The workflow expects the following project structure:

```
mokaroo-clone/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/
│   ├── main.go
│   ├── go.mod
│   └── go.sum
└── README.md
```

## Build Process Details

### 1. Go WebAssembly Compilation

```bash
# Set environment variables for WebAssembly target
GOOS=js GOARCH=wasm go build -o main.wasm main.go

# Copy the WebAssembly JavaScript support file
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ./frontend/public/
```

### 2. React Application Build

The React application is built using Vite with the following configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mokaroo-clone/', // Replace with your repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wasm: ['./public/wasm_exec.js']
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
```

### 3. WebAssembly Integration

The React application loads the WebAssembly module:

```typescript
// src/utils/wasmLoader.ts
export class WasmLoader {
  private go: any;
  private wasmModule: WebAssembly.Module | null = null;

  async loadWasm(): Promise<void> {
    if (this.wasmModule) return;

    // Load the Go WebAssembly support script
    const goWasm = await import('/wasm_exec.js');
    this.go = new goWasm.Go();

    // Fetch and instantiate the WebAssembly module
    const wasmResponse = await fetch('/main.wasm');
    const wasmBytes = await wasmResponse.arrayBuffer();
    
    const wasmModule = await WebAssembly.instantiate(wasmBytes, this.go.importObject);
    this.wasmModule = wasmModule.module;
    
    // Run the Go program
    this.go.run(wasmModule.instance);
  }

  generateData(schema: string, rowCount: number): string {
    if (!window.generateData) {
      throw new Error('WebAssembly module not loaded');
    }
    return window.generateData(schema, rowCount);
  }
}
```

## Environment Variables and Secrets

No secrets are required for this deployment as everything runs client-side. However, you may want to configure:

### Repository Settings

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy to `https://yourusername.github.io/repository-name/`

### Optional Environment Variables

```yaml
env:
  NODE_ENV: production
  VITE_APP_VERSION: ${{ github.sha }}
  VITE_APP_BUILD_DATE: ${{ github.run_number }}
```

## Deployment Verification

The workflow includes verification steps:

```yaml
- name: Verify WebAssembly build
  working-directory: ./backend
  run: |
    if [ ! -f "../frontend/public/main.wasm" ]; then
      echo "WebAssembly file not found!"
      exit 1
    fi
    echo "WebAssembly file size: $(wc -c < ../frontend/public/main.wasm) bytes"

- name: Verify React build
  working-directory: ./frontend
  run: |
    if [ ! -d "dist" ]; then
      echo "React build directory not found!"
      exit 1
    fi
    echo "Build files:"
    ls -la dist/
```

## Performance Optimizations

### WebAssembly Optimization

```bash
# Build with optimizations
GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o main.wasm main.go

# Optional: Use TinyGo for smaller binary size
tinygo build -o main.wasm -target wasm main.go
```

### React Build Optimization

```json
{
  "scripts": {
    "build": "vite build --mode production",
    "build:analyze": "vite build --mode production && npx vite-bundle-analyzer dist/stats.html"
  }
}
```

## Troubleshooting

### Common Issues

1. **WebAssembly file not loading**: Ensure MIME type is set correctly
2. **Build failures**: Check Go and Node.js versions match workflow
3. **Deployment failures**: Verify GitHub Pages is enabled in repository settings

### Debug Steps

```yaml
- name: Debug build artifacts
  run: |
    echo "Frontend build contents:"
    find ./frontend/dist -type f -name "*.wasm" -o -name "*.js" | head -10
    
    echo "WebAssembly file info:"
    file ./frontend/dist/main.wasm || echo "WASM file not found"
```

This workflow ensures a fully automated deployment process that compiles your Go code to WebAssembly, builds the React frontend, and deploys everything to GitHub Pages with proper error handling and verification steps.