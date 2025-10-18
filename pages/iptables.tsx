import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, useTheme, Tabs, Tab } from '@mui/material';
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
  const [editorValue, setEditorValue] = useState('');
  
  const defaultIptablesRules = `*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -p tcp --dport 22 -j ACCEPT
-A INPUT -p tcp --dport 80 -j ACCEPT
-A INPUT -p tcp --dport 443 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp-host-prohibited
COMMIT`;
  const [columns] = useState<GridColDef[]>([
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
    
    // 过滤掉非规则行（例如：表名、空行等）
    const ruleLines = lines.filter(line => 
      line.startsWith('-A') || 
      line.startsWith('-I') || 
      line.startsWith('-D') ||
      line.includes('ACCEPT') || 
      line.includes('DROP') || 
      line.includes('REJECT')
    );
    
    // 解析每条规则
    const rules = ruleLines.map((line, index) => {
      // 移除多余的空格
      const trimmedLine = line.trim();
      
      // 提取链名
      const chainMatch = trimmedLine.match(/-A\s+(\S+)/);
      const chain = chainMatch ? chainMatch[1] : '';
      
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
        .replace(/-j\s+\S+/, '')  // 移除目标
        .replace(/-p\s+\S+/, '')  // 移除协议
        .replace(/-s\s+\S+/, '')  // 移除源地址
        .replace(/-d\s+\S+/, '')  // 移除目标地址
        .replace(/--sport\s+\S+/, '')  // 移除源端口
        .replace(/--dport\s+\S+/, '')  // 移除目标端口
        .replace(/-m\s+comment\s+--comment\s+"[^"]*"/, '')  // 移除注释
        .trim();
      
      return {
        id: index,
        chain,
        target,
        protocol,
        source,
        destination,
        port,
        options,
        comment
      };
    });
    
    return rules;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorValue(value);
    
    // 自动解析规则
    try {
      const rules = parseIptablesRules(value);
      setRulesData(rules);
    } catch (error) {
      console.error('iptables 解析错误:', error);
    }
  };

  const handleCopyToExcel = () => {
    // 创建表头
    const headers = columns.map(col => col.headerName).join('\t');
    
    // 创建数据行
    const rows = rulesData.map(row => 
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

  // 页面初始化时自动解析默认规则
  useEffect(() => {
    setEditorValue(defaultIptablesRules);
    try {
      const rules = parseIptablesRules(defaultIptablesRules);
      setRulesData(rules);
    } catch (error) {
      console.error('iptables 解析错误:', error);
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
                  disabled={rulesData.length === 0}
                >
                  复制到 Excel
                </Button>
              </Box>
              
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
                    rows={rulesData}
                    columns={columns}
                    hideFooter
                    disableRowSelectionOnClick
                  />
                )}
                {activeTab === 1 && (
                  <IptablesVisualization rules={rulesData} />
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