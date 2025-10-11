import React from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Box } from '@mui/material';

loader.config({
  paths: {
    vs: '/vs',
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
  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 14,
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
        p: 1 
      }}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        options={defaultOptions}
      />
    </Box>
  );
};

export default CodeEditor;
