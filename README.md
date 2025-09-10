# Code to Table Tool

A React-based web application that converts code structures into structured table formats, making it easier to document and analyze code schemas and Java class structures.

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

## Tech Stack

- **Frontend**: React 19.1.0 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Code Editor**: Monaco Editor
- **Data Grid**: MUI X DataGrid
- **Java Parser**: java-parser v2.3.4
- **Routing**: React Router DOM v7

## Getting Started

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

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

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

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: This is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
src/
├── App.tsx              # Main application component with JSON Schema parser
├── JavaToTable.tsx      # Java code parser component
├── TopNav.tsx          # Navigation component
├── index.tsx           # Application entry point
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.
