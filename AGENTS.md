# AGENTS.md - FrontLives Project Guide

This file contains essential information for agentic coding assistants working in the FrontLives repository.

## Project Overview

FrontLives is a frontend demo collection repository (前端live：前端demo合集) showcasing various frontend technologies and implementations. The repository contains multiple distinct projects:

- **React App** (`/react-app`) - Modern React application with Vite and MSW
- **H5 Visualization** (`/h5`) - D3.js data visualization with glassmorphism UI

## Build Commands

### React App (Primary Project)
```bash
cd react-app
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### H5 Visualization Project
```bash
cd h5
# Python 3 server
python -m http.server 8000

# Node.js server (requires serve)
npm install -g serve
serve

# Or use VS Code Live Server extension
```

## Testing

### React App Testing
- **Manual Testing**: Use the built-in MSW test interface in React App
- **API Testing**: Test endpoints via the UI at `http://localhost:5173`
- **Console Monitoring**: Check browser console for detailed API logs
- **Network Tab**: Verify MSW interception in browser dev tools

### Single Test Execution
For React App, use the manual test interface:
1. Start dev server: `cd react-app && npm run dev`
2. Open browser to `http://localhost:5173`
3. Use the UI buttons to test individual API endpoints
4. Monitor results in the UI and console

## Code Style Guidelines

### General Conventions
- **Language**: JavaScript (ES2020+) with JSX for React
- **Modules**: ES modules (`import`/`export`) throughout
- **Formatting**: Consistent indentation and spacing
- **Comments**: Minimal, only when necessary for complex logic

### Import Conventions
```javascript
// React imports
import React, { useState, useEffect } from 'react'

// Local imports (relative)
import './App.css'
import { mockApi } from './mocks/mockApi'

// External libraries
import d3 from 'd3'
```

### Naming Conventions
- **Components**: PascalCase (`MyComponent`, `AppHeader`)
- **Functions**: camelCase (`testAPI`, `initChart`)
- **Variables**: camelCase (`testResults`, `currentTime`)
- **Constants**: UPPER_SNAKE_CASE (`CONFIG`, `RESOURCES`)
- **Files**: 
  - React components: PascalCase (`App.jsx`)
  - JavaScript files: camelCase (`chart.js`, `utils.js`)
  - CSS files: kebab-case (`style.css`)
  - Config files: kebab-case (`package.json`, `vite.config.js`)

### React Component Patterns
```javascript
// Functional components with hooks
function App() {
  const [state, setState] = useState({})
  
  const handleClick = async () => {
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setState(prev => ({ ...prev, data }))
    } catch (error) {
      console.error('API call failed:', error)
    }
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleClick}>Test API</button>
    </div>
  )
}

export default App
```

### Error Handling
- **API Calls**: Always wrap in try-catch blocks
- **User Feedback**: Provide clear error messages via UI alerts
- **Console Logging**: Log detailed errors for debugging
- **Graceful Degradation**: Fallback to alternative solutions when possible

### State Management
- **React State**: Use `useState` for local component state
- **Global State**: Use `window` object for shared variables in H5 project
- **Async State**: Handle loading states and error states appropriately

### CSS and Styling
- **React App**: Inline styles for dynamic values, CSS files for static styles
- **H5 Project**: CSS custom properties (variables) for theming
- **Glassmorphism**: Use backdrop-filter and rgba colors for glass effects
- **Responsive**: Mobile-first approach with appropriate breakpoints

### JavaScript Patterns
```javascript
// Async/await preferred
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint)
    return await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// Arrow functions for callbacks
const processData = (data) => data.map(item => ({
  ...item,
  processed: true
}))

// Destructuring for clean code
const { name, value, options = {} } = config
```

## File Organization

### React App Structure
```
react-app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   ├── index.css        # Global styles
│   ├── App.css          # Component styles
│   └── mocks/           # MSW mock configurations
│       ├── handlers.js  # API route handlers
│       ├── browser.js   # Browser MSW setup
│       └── mockApi.js   # Fallback mock API
├── public/
│   └── mockServiceWorker.js  # Service Worker for MSW
├── package.json
├── vite.config.js
└── eslint.config.js
```

### H5 Project Structure
```
h5/
├── D3-zhuzhuangtu.html    # Main visualization page
├── config.json            # Default configuration
├── css/style.css          # Stylesheets
├── js/
│   ├── chart.js           # Core D3 chart logic
│   ├── ui.js              # UI controls
│   └── utils.js           # Utility functions
├── datas/                 # Data files
│   ├── companyLogos.json  # Company logo mappings
│   ├── company_info.json  # Company information
│   └── topE.json          # Additional data
└── sandiantu/             # Scatter plot visualization
```

## Linting and Code Quality

### ESLint Configuration
- **Base Config**: JavaScript recommended
- **React Plugins**: React hooks and refresh plugins
- **Parser Options**: ES2020+ with JSX support
- **Special Rule**: Unused variables allowed for uppercase/prefixed variables

### Running Lint
```bash
cd react-app
npm run lint
```

### Common Lint Issues
- Fix unused variable warnings
- Ensure proper import/export syntax
- Maintain consistent code formatting

## Development Workflow

### Git Workflow
- **Branch**: `main` is primary branch
- **Commits**: Descriptive commit messages
- **Remote**: Keep origin/main up-to-date

### Before Making Changes
1. Read existing code to understand patterns
2. Check for similar implementations
3. Follow established naming conventions
4. Test changes thoroughly

### After Making Changes
1. Run lint: `cd react-app && npm run lint`
2. Test functionality manually
3. Check browser console for errors
4. Verify MSW functionality if applicable

## Technology Stack

### React App
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Mock Service**: MSW 2.12.7
- **Linting**: ESLint 9.39.1

### H5 Visualization
- **Core**: Vanilla JavaScript
- **Visualization**: D3.js v7
- **Styling**: CSS with glassmorphism effects
- **Data**: JSON configuration system

## AI Assistant Integration

The repository includes Cursor skills for technical writing:
- **Location**: `/.cursor/skills/article-writer/SKILL.md`
- **Purpose**: Technical article writing assistance
- **Usage**: Available when writing documentation or tutorials

## Important Notes

### MSW Configuration
- Service Worker located in `public/` directory
- Automatic fallback to in-memory mocks if MSW fails
- Test via React App UI for proper functionality

### Cross-Project Considerations
- React App uses modern ES modules and JSX
- H5 project uses vanilla JavaScript with D3.js
- Maintain consistent coding style across both projects
- Respect project-specific conventions when working in each directory

### Performance Considerations
- Use React.memo for expensive components
- Implement proper cleanup in useEffect
- Optimize D3.js animations for smooth rendering
- Use appropriate data structures for large datasets

---

This guide should help agentic assistants understand the project structure, coding conventions, and development workflow. When in doubt, examine existing code patterns and follow the established conventions.