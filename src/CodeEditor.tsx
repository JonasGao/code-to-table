import React from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Box, useTheme } from '@mui/material';

loader.config({
  paths: {
    vs: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/vs`,
  }
});

interface CodeEditorProps {
  height?: string | number;
  language?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  options?: any;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  height = "100%",
  language = "json",
  value,
  defaultValue,
  onChange,
  readOnly = false,
  options = {},
  className
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 16,
    readOnly,
    ...options
  };

  return (
    <Box 
      className={className}
      sx={{ 
        flex: 1, 
        border: '1px solid #ccc', 
        borderRadius: 1, 
        overflow: 'hidden', 
        mb: 2, 
        p: 1,
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff'
      }}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        theme={isDarkMode ? 'vs-dark' : 'vs'}
        defaultValue={defaultValue}
        onChange={onChange}
        options={defaultOptions}
      />
    </Box>
  );
};

export default CodeEditor;