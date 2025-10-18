import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, useTheme, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableChartIcon from '@mui/icons-material/TableChart';
import TopNav from '../src/TopNav';
import CodeEditor from '../src/CodeEditor';
import IptablesVisualization from '../src/IptablesVisualization';

function IptablesParser() {
  const theme = useTheme();
  const [rulesData, setRulesData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  
  // 从 localStorage 加载或使用空值
  const [editorValue, setEditorValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iptables-editor-value');
      return saved || '';
    }
    return '';
  });
  const [columns] = useState<GridColDef[]>([
    { field: 'table', headerName: '表', width: 100 },
    { field: 'chain', headerName: '链名', width: 120 },
    { field: 'target', headerName: '目标', width: 120 },
    { field: 'protocol', headerName: '协议', width: 100 },
    { field: 'source', headerName: '源地址', width: 150 },
    { field: 'destination', headerName: '目标地址', width: 150 },
    { field: 'port', headerName: '端口', width: 150 },
    { field: 'options', headerName: '选项', width: 200 },
    { field: 'comment', headerName: '注释', width: 200 },
  ]);

  const parseIptablesRules = (input: string): any[] => {
    // 分割输入为行
    const lines = input.split('\n').filter(line => line.trim() !== '');
    
    const allRules: any[] = [];
    let currentTable = 'filter'; // 默认表
    let ruleIndex = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检查是否是表声明行
      if (trimmedLine.startsWith('*')) {
        currentTable = trimmedLine.substring(1); // 移除 * 符号
        continue;
      }
      
      // 检查是否是规则行
      if (trimmedLine.startsWith('-A') || 
          trimmedLine.startsWith('-I') || 
          trimmedLine.startsWith('-D') ||
          trimmedLine.includes('ACCEPT') || 
          trimmedLine.includes('DROP') || 
          trimmedLine.includes('REJECT') ||
          trimmedLine.includes('SNAT') ||
          trimmedLine.includes('DNAT') ||
          trimmedLine.includes('MASQUERADE')) {
        
        // 提取链名
        const chainMatch = trimmedLine.match(/-A\s+(\S+)|-I\s+(\S+)|-D\s+(\S+)/);
        const chain = chainMatch ? (chainMatch[1] || chainMatch[2] || chainMatch[3]) : '';
        
        // 提取目标
        const targetMatch = trimmedLine.match(/-j\s+(\S+)/);
        const target = targetMatch ? targetMatch[1] : '';
        
        // 提取协议
        const protocolMatch = trimmedLine.match(/-p\s+(\S+)/);
        const protocol = protocolMatch ? protocolMatch[1] : '';
        
        // 提取源地址
        const sourceMatch = trimmedLine.match(/-s\s+(\S+)/);
        const source = sourceMatch ? sourceMatch[1] : '';
        
        // 提取目标地址
        const destinationMatch = trimmedLine.match(/-d\s+(\S+)/);
        const destination = destinationMatch ? destinationMatch[1] : '';
        
        // 提取端口
        const portMatch = trimmedLine.match(/--sport\s+(\S+)|--dport\s+(\S+)/);
        const port = portMatch ? (portMatch[1] || portMatch[2]) : '';
        
        // 提取注释
        const commentMatch = trimmedLine.match(/-m\s+comment\s+--comment\s+"([^"]*)"/);
        const comment = commentMatch ? commentMatch[1] : '';
        
        // 提取其他选项
        const options = trimmedLine
          .replace(/-A\s+\S+/, '')  // 移除链名
          .replace(/-I\s+\S+/, '')  // 移除插入链名
          .replace(/-D\s+\S+/, '')  // 移除删除链名
          .replace(/-j\s+\S+/, '')  // 移除目标
          .replace(/-p\s+\S+/, '')  // 移除协议
          .replace(/-s\s+\S+/, '')  // 移除源地址
          .replace(/-d\s+\S+/, '')  // 移除目标地址
          .replace(/--sport\s+\S+/, '')  // 移除源端口
          .replace(/--dport\s+\S+/, '')  // 移除目标端口
          .replace(/-m\s+comment\s+--comment\s+"[^"]*"/, '')  // 移除注释
          .trim();
        
        allRules.push({
          id: ruleIndex++,
          table: currentTable,
          chain,
          target,
          protocol,
          source,
          destination,
          port,
          options,
          comment
        });
      }
    }
    
    return allRules;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorValue(value);
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('iptables-editor-value', value);
    }
    
    // 自动解析规则
    try {
      const rules = parseIptablesRules(value);
      setRulesData(rules);
      
      // 提取可用的表
      const tableSet = new Set(rules.map(rule => rule.table));
      const tables = Array.from(tableSet);
      setAvailableTables(tables);
      
      // 如果还没有选择表，默认选择所有表
      if (selectedTables.length === 0) {
        setSelectedTables(tables);
      }
    } catch (error) {
      console.error('iptables 解析错误:', error);
    }
  };

  const handleCopyToExcel = () => {
    // 创建表头
    const headers = columns.map(col => col.headerName).join('\t');
    
    // 创建数据行
    const rows = filteredRulesData.map(row => 
      columns.map(col => row[col.field]).join('\t')
    ).join('\n');
    
    // 组合成完整的表格数据
    const excelData = `${headers}\n${rows}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(excelData).then(() => {
      alert('数据已复制到剪贴板，请粘贴到 Excel 中');
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTableChange = (event: any) => {
    const value = event.target.value;
    setSelectedTables(typeof value === 'string' ? value.split(',') : value);
  };

  // 过滤规则数据
  const filteredRulesData = rulesData.filter(rule => 
    selectedTables.length === 0 || selectedTables.includes(rule.table)
  );

  // 页面初始化时自动解析规则（如果有内容）
  useEffect(() => {
    if (editorValue) {
      try {
        const rules = parseIptablesRules(editorValue);
        setRulesData(rules);
      } catch (error) {
        console.error('iptables 解析错误:', error);
      }
    }
  }, []);

  return (
    <div>
      <TopNav />
      <div style={{ marginTop: 60 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" gutterBottom>
            iptables 规则解析器
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 150px)' }}>
            <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <Typography variant="h6" gutterBottom>
                iptables-save 输出
              </Typography>
              <CodeEditor
                height="100%"
                language="bash"
                value={editorValue}
                onChange={handleEditorChange}
              />
            </Paper>
            <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  解析结果
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyToExcel}
                  disabled={filteredRulesData.length === 0}
                >
                  复制到 Excel
                </Button>
              </Box>
              
              {/* 表选择器 */}
              {availableTables.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>选择表</InputLabel>
                    <Select
                      multiple
                      value={selectedTables}
                      onChange={handleTableChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {availableTables.map((table) => (
                        <MenuItem key={table} value={table}>
                          {table}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab 
                  icon={<TableChartIcon />} 
                  label="表格视图" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<VisibilityIcon />} 
                  label="可视化图表" 
                  iconPosition="start"
                />
              </Tabs>
              
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 0 && (
                  <DataGrid
                    rows={filteredRulesData}
                    columns={columns}
                    hideFooter
                    disableRowSelectionOnClick
                  />
                )}
                {activeTab === 1 && (
                  <IptablesVisualization rules={filteredRulesData} />
                )}
              </Box>
            </Paper>
          </Box>
        </Container>
      </div>
    </div>
  );
}

export default IptablesParser;