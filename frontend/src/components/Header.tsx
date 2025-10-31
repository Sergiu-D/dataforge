import { Database, Github, Sparkles } from 'lucide-react'

const Header = () => {
  return (
    <header className="glass-card-strong sticky top-0 z-50 animate-slide-down">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-sm opacity-75 animate-pulse-soft"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-2xl shadow-glow">
                <Database className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold gradient-text text-shadow">
                MockData Generator
              </h1>
              <p className="text-sm text-neutral-600 font-medium">
                Generate realistic test data with modern performance
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 glass-card rounded-full">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <span className="text-sm font-medium text-neutral-700">Powered by WebAssembly</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center space-x-2 hover:scale-105 transition-all duration-200"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header