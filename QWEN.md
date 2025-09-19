# Code to Table Tool - Project Documentation

## Project Overview

This is a React-based web application built with TypeScript that provides tools for converting code structures into structured table formats. The application consists of three main tools:

1. **JSON Schema Parser** - Parses JSON Schema definitions and converts them to structured tables
2. **Java to Table Tool** - Parses Java class files and extracts field information
3. **Docker Configuration Generator** - Generates Docker daemon configuration in JSON format

The application uses modern web technologies including:
- Next.js 15 for the frontend framework
- TypeScript for type safety
- Material-UI (MUI) v7 for UI components
- Monaco Editor for code editing
- MUI X DataGrid for displaying tabular data
- java-parser v2.3.4 for Java code parsing

## Project Structure

```
src/
├── App.tsx              # Main application component with JSON Schema parser
├── JavaToTable.tsx      # Java code parser component
├── TopNav.tsx           # Navigation component
├── index.tsx            # Application entry point
└── ...

pages/
├── _app.tsx             # Next.js application wrapper
├── docker-config.tsx    # Docker configuration generator
├── index.tsx            # JSON Schema parser homepage
└── java-to-table.tsx    # Java to table conversion page

public/
├── favicon.ico
├── robots.txt
└── ...
```

## Building and Running

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd code-to-table
```

2. Install dependencies:
```bash
npm install
```

### Development
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Production
Build for production:
```bash
npm run build
```

### Testing
Run tests:
```bash
npm test
```

## Features

### 🔍 JSON Schema Parser
- Parse JSON Schema definitions and convert them to structured tables
- Extract property names, types, descriptions, and required fields
- Visual editor with syntax highlighting powered by Monaco Editor
- Export parsed data directly to Excel format

### ☕ Java to Table Tool
- Parse Java class files and extract field information
- Support for field modifiers (public, private, protected)
- Extract field types, names, and Javadoc comments
- Real-time parsing with Monaco Editor
- Export field data to Excel format

### 🐳 Docker Configuration Generator
- Configure Docker daemon settings through a user-friendly interface
- Generate complete daemon.json configuration files
- Support for basic, network, and advanced Docker configurations
- Preview and copy generated JSON configuration to clipboard

## Technology Stack

- **Frontend**: React 18.3.1 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Code Editor**: Monaco Editor
- **Data Grid**: MUI X DataGrid
- **Java Parser**: java-parser v2.3.4
- **Routing**: React Router DOM v7
- **Framework**: Next.js 15

## Usage

### JSON Schema Parser
1. Navigate to the home page
2. Paste your JSON Schema into the left editor panel
3. The parsed results will automatically appear in the right table
4. Click "复制到 Excel" to copy the data in Excel-compatible format

### Java to Table Tool
1. Navigate to "Java转表格" page
2. Paste your Java class code into the editor
3. Click "解析" to parse the Java code
4. View the extracted field information in the table
5. Click "复制到Excel" to export the data

### Docker Configuration Generator
1. Navigate to "Docker配置生成" page
2. Configure your Docker daemon settings using the form
3. Preview the generated JSON configuration
4. Copy the configuration to clipboard for use in Docker setup

## Development Conventions

- Follow TypeScript best practices with strong typing
- Use React hooks for state management
- Implement responsive design with Material-UI components
- Maintain clean separation of concerns between components
- Use Monaco Editor for syntax-highlighted code editing
- Implement proper error handling and validation
- Follow MUI design guidelines for consistent UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.