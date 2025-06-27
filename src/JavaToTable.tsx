import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

function parseJavaFields(javaCode: string) {
  // 支持 /** ... */ 注释和 // 注释
  const fieldRegex = /(?:\/\*\*([\s\S]*?)\*\/|\/\/([^\n]*))?\s*private\s+([\w<>\[\]]+)\s+(\w+);/g;
  const rows = [];
  let match;
  let id = 0;
  while ((match = fieldRegex.exec(javaCode)) !== null) {
    const blockComment = match[1]?.replace(/\*/g, '').trim();
    const lineComment = match[2]?.trim();
    const type = match[3];
    const name = match[4];
    rows.push({
      id: id++,
      name,
      type,
      comment: blockComment || lineComment || '',
    });
  }
  return rows;
}

const columns: GridColDef[] = [
  { field: 'name', headerName: '字段名', width: 150 },
  { field: 'type', headerName: '类型', width: 150 },
  { field: 'comment', headerName: '注释', width: 300 },
];

const JavaToTable: React.FC = () => {
  const [javaCode, setJavaCode] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  const handleParse = () => {
    setRows(parseJavaFields(javaCode));
  };

  const handleCopyToExcel = () => {
    const headers = columns.map(col => col.headerName).join('\t');
    const dataRows = rows.map(row => columns.map(col => row[col.field]).join('\t')).join('\n');
    const excelData = `${headers}\n${dataRows}`;
    navigator.clipboard.writeText(excelData).then(() => {
      alert('数据已复制到剪贴板，请粘贴到 Excel 中');
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Java转表格工具</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="粘贴Java类代码"
          multiline
          minRows={8}
          fullWidth
          value={javaCode}
          onChange={e => setJavaCode(e.target.value)}
          variant="outlined"
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleParse}>解析</Button>
          <Button variant="outlined" onClick={handleCopyToExcel} disabled={rows.length === 0}>复制到Excel</Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          hideFooter
          disableRowSelectionOnClick
        />
      </Paper>
    </Container>
  );
};

export default JavaToTable; 
