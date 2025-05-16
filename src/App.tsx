import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button } from '@mui/material';
import Editor from '@monaco-editor/react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function App() {
  const [schemaData, setSchemaData] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    try {
      const schema = JSON.parse(value);
      const properties = schema.properties || {};
      
      // 创建列定义
      const newColumns: GridColDef[] = [
        { field: 'property', headerName: '属性名', width: 150 },
        { field: 'title', headerName: '标题', width: 150 },
        { field: 'type', headerName: '类型', width: 150 },
        { field: 'description', headerName: '描述', width: 300 },
        { field: 'required', headerName: '是否必填', width: 100 },
      ];
      setColumns(newColumns);

      // 创建行数据
      const rows = Object.entries(properties).map(([key, value]: [string, any], index) => ({
        id: index,
        property: key,
        title: value.title || '',
        type: value.$ref ? 'object' : (value.type || ''),
        description: value.description || '',
        required: schema.required?.includes(key) ? '是' : '否',
      }));
      
      setSchemaData(rows);
    } catch (error) {
      console.error('JSON 解析错误:', error);
    }
  };

  const handleCopyToExcel = () => {
    // 创建表头
    const headers = columns.map(col => col.headerName).join('\t');
    
    // 创建数据行
    const rows = schemaData.map(row => 
      columns.map(col => row[col.field]).join('\t')
    ).join('\n');
    
    // 组合成完整的表格数据
    const excelData = `${headers}\n${rows}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(excelData).then(() => {
      alert('数据已复制到剪贴板，请粘贴到 Excel 中');
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        JSON Schema 解析器
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 150px)' }}>
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography variant="h6" gutterBottom>
            JSON Schema 编辑器
          </Typography>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              defaultLanguage="json"
              defaultValue='{"properties":{}}'
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </Box>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            解析结果
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyToExcel}
              disabled={schemaData.length === 0}
            >
              复制到 Excel
            </Button>
          </Typography>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <DataGrid
              rows={schemaData}
              columns={columns}
              hideFooter
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
