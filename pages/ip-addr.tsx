import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, useTheme, Tabs, Tab, Chip, Divider, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableChartIcon from '@mui/icons-material/TableChart';
import TopNav from '../src/TopNav';
import CodeEditor from '../src/CodeEditor';

interface NetworkInterface {
  id: string;
  name: string;
  flags: string[];
  mtu: string;
  mac: string;
  ipAddresses: { 
    address: string; 
    prefix: string; 
    scope: string;
    gateway?: string;
    broadcast?: string;
    subnetMask?: string;
  }[];
  state: string;
  linkType?: string;
}

function IpAddrParser() {
  const theme = useTheme();
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // 网络接口标志的说明映射
  const flagDescriptions: Record<string, string> = {
    'UP': '接口已启用并运行',
    'LOOPBACK': '这是一个回环接口',
    'LOWER_UP': '物理连接已建立',
    'NO-CARRIER': '物理连接断开',
    'BROADCAST': '接口支持广播',
    'MULTICAST': '接口支持多播',
    'POINTOPOINT': '点对点连接',
    'PROMISC': '接口处于混杂模式',
    'ALLMULTI': '接收所有多播数据包',
    'DYNAMIC': '接口地址是动态分配的',
    'SLAVE': '接口是绑定组的从属接口',
    'MASTER': '接口是绑定组的主接口',
    'RUNNING': '接口处于运行状态',
    'NOARP': '接口不使用ARP',
    'NOTRAILERS': '不使用尾部打包',
    'DEBUG': '调试模式启用',
    'SMART': '接口支持SMART功能',
    'PORTSEL': '端口选择功能',
    'AUTOMEDIA': '自动媒体选择',
    'DORMANT': '接口处于休眠状态',
    'ECHO': '回显功能'
  };
  
  // 从 localStorage 加载或使用空值
  const [editorValue, setEditorValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ipaddr-editor-value');
      return saved || '';
    }
    return '';
  });
  
  // 组件挂载时自动解析从localStorage加载的数据
  useEffect(() => {
    if (editorValue) {
      try {
        const parsedInterfaces = parseIpAddrOutput(editorValue);
        setInterfaces(parsedInterfaces);
      } catch (error) {
        console.error('Initial ip addr parse error:', error);
      }
    }
  }, []); // 空依赖数组表示只在组件挂载时执行一次

  const parseIpAddrOutput = (input: string): NetworkInterface[] => {
    const networkInterfaces: NetworkInterface[] = [];
    const lines = input.split('\n').filter(line => line.trim() !== '');
    
    let currentInterface: NetworkInterface | null = null;
    let currentIndex = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检查是否是接口开始行（例如：1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000）
      const interfaceMatch = trimmedLine.match(/^(\d+):\s+([^:]+):\s+<([^>]+)>\s+mtu\s+(\d+)\s+.*\s+state\s+([A-Z]+)/);
      if (interfaceMatch) {
        // 如果有当前接口，先保存
        if (currentInterface) {
          networkInterfaces.push(currentInterface);
        }
        
        const [, id, name, flags, mtu, state] = interfaceMatch;
        currentInterface = {
          id,
          name,
          flags: flags.split(','),
          mtu,
          mac: '',
          ipAddresses: [],
          state
        };
        currentIndex++;
        continue;
      }
      
      // 检查是否是MAC地址行（例如：link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00）
      const macMatch = trimmedLine.match(/link\/([^\s]+)\s+([0-9a-f:]+)/);
      if (macMatch && currentInterface) {
        currentInterface.linkType = macMatch[1];
        currentInterface.mac = macMatch[2];
        continue;
      }
      
      // 检查是否是IP地址行（例如：inet 127.0.0.1/8 scope host lo）
      // 修改为更灵活的正则表达式，以匹配不同格式的IPv4地址行
      const ipv4Match = trimmedLine.match(/inet\s+([0-9.]+)\/(\d+)(?:\s+scope\s+([^\s]+))?/);
      if (ipv4Match && currentInterface) {
        const [, address, prefix, scope] = ipv4Match;
        
        // 创建IP地址对象
        const ipObj = {
          address,
          prefix,
          scope: scope || 'unknown',
          subnetMask: '',
          broadcast: ''
        };
        
        // 计算子网掩码
        const prefixLen = parseInt(prefix);
        if (prefixLen >= 0 && prefixLen <= 32) {
          const mask = Array.from({length: 32}, (_, i) => i < prefixLen ? 1 : 0)
            .join('')
            .match(/.{1,8}/g)!
            .map(octet => parseInt(octet, 2))
            .join('.');
          ipObj.subnetMask = mask;
        }
        
        // 尝试从行中提取广播地址（如果存在）
        const broadcastMatch = trimmedLine.match(/brd\s+([0-9.]+)/);
        if (broadcastMatch) {
          ipObj.broadcast = broadcastMatch[1];
        }
        
        currentInterface.ipAddresses.push(ipObj);
        continue;
      }
      
      // 检查是否包含网关信息的行
      const gatewayMatch = trimmedLine.match(/default\s+via\s+([0-9.]+)/);
      if (gatewayMatch && currentInterface && currentInterface.ipAddresses.length > 0) {
        // 将网关信息添加到最后一个IP地址对象
        currentInterface.ipAddresses[currentInterface.ipAddresses.length - 1].gateway = gatewayMatch[1];
        continue;
      }
      
      // 检查是否是IPv6地址行（例如：inet6 ::1/128 scope host）
      const ipv6Match = trimmedLine.match(/inet6\s+([0-9a-f:]+)\/(\d+)\s+scope\s+([^\s]+)/);
      if (ipv6Match && currentInterface) {
        const [, address, prefix, scope] = ipv6Match;
        currentInterface.ipAddresses.push({
          address,
          prefix,
          scope
        });
        continue;
      }
    }
    
    // 保存最后一个接口
    if (currentInterface) {
      networkInterfaces.push(currentInterface);
    }
    
    return networkInterfaces;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorValue(value);
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ipaddr-editor-value', value);
    }
    
    // 自动解析接口信息
    try {
      const parsedInterfaces = parseIpAddrOutput(value);
      setInterfaces(parsedInterfaces);
    } catch (error) {
      console.error('ip addr 解析错误:', error);
    }
  };

  const handleCopyInterface = (interfaceInfo: NetworkInterface) => {
    const text = `接口: ${interfaceInfo.name}\n` +
                 `ID: ${interfaceInfo.id}\n` +
                 `状态: ${interfaceInfo.state}\n` +
                 `MTU: ${interfaceInfo.mtu}\n` +
                 `MAC: ${interfaceInfo.mac}\n` +
                 `标志: ${interfaceInfo.flags.join(', ')}\n` +
                 `IP地址:\n` +
                 interfaceInfo.ipAddresses.map(ip => 
                   `  - ${ip.address}/${ip.prefix}\n` +
                   `    作用域: ${ip.scope}\n` +
                   `    子网掩码: ${ip.subnetMask || '-'}\n` +
                   `    广播地址: ${ip.broadcast || '-'}\n` +
                   `    网关: ${ip.gateway || '-'}`
                 ).join('\n') + '\n';
    
    navigator.clipboard.writeText(text).then(() => {
      alert(`接口 ${interfaceInfo.name} 信息已复制到剪贴板`);
    });
  };

  const handleCopyAllToExcel = () => {
    // 创建表头
    const headers = ['接口', 'ID', '状态', 'MTU', 'MAC', '标志', 'IP地址', '前缀', '作用域', '子网掩码', '广播地址', '网关'];
    
    // 创建数据行
    let rows: string[] = [];
    interfaces.forEach(intf => {
      if (intf.ipAddresses.length === 0) {
        // 没有IP地址的接口
        rows.push(headers.map(() => '').join('\t')); // 空行
        rows.push([
          intf.name,
          intf.id,
          intf.state,
          intf.mtu,
          intf.mac,
          intf.flags.join(', '),
          '',
          '',
          '',
          '',
          '',
          ''
        ].join('\t'));
      } else {
        // 有IP地址的接口，为每个IP地址创建一行
        intf.ipAddresses.forEach((ip, index) => {
          if (index === 0) {
            // 第一行包含接口基本信息
            rows.push([
              intf.name,
              intf.id,
              intf.state,
              intf.mtu,
              intf.mac,
              intf.flags.join(', '),
              ip.address,
              ip.prefix,
              ip.scope,
              ip.subnetMask || '',
              ip.broadcast || '',
              ip.gateway || ''
            ].join('\t'));
          } else {
            // 后续行只包含IP信息
            rows.push([
              '',
              '',
              '',
              '',
              '',
              '',
              ip.address,
              ip.prefix,
              ip.scope,
              ip.subnetMask || '',
              ip.broadcast || '',
              ip.gateway || ''
            ].join('\t'));
          }
        });
      }
    });
    
    // 组合成完整的表格数据
    const excelData = `${headers.join('\t')}\n${rows.join('\n')}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(excelData).then(() => {
      alert('数据已复制到剪贴板，请粘贴到 Excel 中');
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            IP 地址解析工具
          </Typography>
          <Typography variant="body1" paragraph>
            请在下方编辑器中粘贴 `ip addr` 命令的输出结果，系统将自动解析并以接口为单位展示详细信息。
          </Typography>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="tabs">
            <Tab label="输入" icon={<VisibilityIcon />} iconPosition="start" />
            <Tab label="解析结果" icon={<TableChartIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
            <CodeEditor
              height="100%"
              language="text"
              value={editorValue}
              onChange={handleEditorChange}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => {
                  try {
                    const parsedInterfaces = parseIpAddrOutput(editorValue);
                    setInterfaces(parsedInterfaces);
                    setActiveTab(1);
                  } catch (error) {
                    console.error('Parse error:', error);
                    // 即使出错也切换到结果标签页，以便用户看到可能的解析结果或错误提示
                    setActiveTab(1);
                  }
                }}
                startIcon={<TableChartIcon />}
              >
                查看解析结果
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {interfaces.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleCopyAllToExcel}
                    startIcon={<ContentCopyIcon />}
                  >
                    复制全部数据到Excel
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {interfaces.map((intf, index) => (
                    <Paper 
                      key={intf.id || index} 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        borderLeft: `4px solid ${theme.palette.primary.main}`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                          {intf.name}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          onClick={() => handleCopyInterface(intf)}
                          size="small"
                          startIcon={<ContentCopyIcon />}
                        >
                          复制
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                          <Typography>{intf.id}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">状态</Typography>
                          <Chip 
                            label={intf.state} 
                            color={intf.state === 'UP' ? 'success' : 'default'} 
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">MTU</Typography>
                          <Typography>{intf.mtu}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">MAC 地址</Typography>
                          <Typography>{intf.mac}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">链接类型</Typography>
                          <Typography>{intf.linkType || '-'}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>标志</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {intf.flags.map((flag, i) => (
                            <Tooltip 
                              key={i} 
                              title={flagDescriptions[flag] || `未知标志: ${flag}`}
                              arrow
                              placement="top"
                            >
                              <Chip label={flag} size="small" />
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>IP 地址信息</Typography>
                        {intf.ipAddresses.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {intf.ipAddresses.map((ip, i) => (
                              <Box 
                                key={i} 
                                sx={{ 
                                  p: 2, 
                                  border: '1px solid', 
                                  borderColor: theme.palette.divider,
                                  borderRadius: 1,
                                  display: 'grid',
                                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                                  gap: 2
                                }}
                              >
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">地址</Typography>
                                  <Typography fontWeight="medium">{ip.address}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">前缀</Typography>
                                  <Typography>{ip.prefix}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">作用域</Typography>
                                  <Chip label={ip.scope} size="small" />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">子网掩码</Typography>
                                  <Typography>{ip.subnetMask || '-'}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">广播地址</Typography>
                                  <Typography>{ip.broadcast || '-'}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">网关</Typography>
                                  <Typography>{ip.gateway || '-'}</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="text.secondary">无配置的 IP 地址</Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {editorValue ? '未检测到有效的接口信息，请检查输入格式' : '请先输入 ip addr 命令的输出结果'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </div>
  );
}

export default IpAddrParser;