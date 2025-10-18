import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface Rule {
  id: number;
  table: string;
  chain: string;
  target: string;
  protocol: string;
  source: string;
  destination: string;
  port: string;
  options: string;
  comment: string;
}

interface IptablesVisualizationProps {
  rules: Rule[];
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'chain' | 'rule' | 'target' | 'endpoint';
  color: string;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  color: string;
  dashed?: boolean;
}

const IptablesVisualization: React.FC<IptablesVisualizationProps> = ({ rules }) => {
  const getRuleColor = (target: string): string => {
    switch (target) {
      case 'ACCEPT': return '#4CAF50';
      case 'DROP': return '#F44336';
      case 'REJECT': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const { nodes, connections, tableGroups } = useMemo(() => {
    const nodes: Node[] = [];
    const connections: Connection[] = [];
    const tableGroups: { [table: string]: { nodes: Node[], connections: Connection[] } } = {};
    
    // 按表分组规则
    const rulesByTable = rules.reduce((acc, rule) => {
      if (!acc[rule.table]) {
        acc[rule.table] = [];
      }
      acc[rule.table].push(rule);
      return acc;
    }, {} as Record<string, Rule[]>);
    
    // 为每个表创建可视化
    Object.entries(rulesByTable).forEach(([table, tableRules], tableIndex) => {
      const tableNodes: Node[] = [];
      const tableConnections: Connection[] = [];
      
      // 定义链的位置（为每个表偏移）
      const baseX = 200 + (tableIndex * 800);
      const chainPositions = {
        INPUT: { x: baseX, y: 100 },
        FORWARD: { x: baseX + 200, y: 100 },
        OUTPUT: { x: baseX + 400, y: 100 },
        PREROUTING: { x: baseX, y: 50 },
        POSTROUTING: { x: baseX + 400, y: 50 }
      };
      
      // 添加表标题
      tableNodes.push({
        id: `${table}-title`,
        x: baseX + 200,
        y: 20,
        label: `表: ${table.toUpperCase()}`,
        type: 'chain',
        color: '#9C27B0'
      });
      
      // 添加链节点
      Object.entries(chainPositions).forEach(([chain, pos]) => {
        tableNodes.push({
          id: `${table}-${chain}`,
          x: pos.x,
          y: pos.y,
          label: chain,
          type: 'chain',
          color: '#2196F3'
        });
      });
      
      // 添加外部节点（每个表都有）
      tableNodes.push(
        { id: `${table}-internet`, x: baseX - 100, y: 200, label: 'Internet', type: 'endpoint', color: '#FF9800' },
        { id: `${table}-local`, x: baseX + 500, y: 200, label: 'Local Network', type: 'endpoint', color: '#4CAF50' }
      );
      
      // 处理每个链的规则
      const chainRules = tableRules.reduce((acc, rule) => {
        if (!acc[rule.chain]) {
          acc[rule.chain] = [];
        }
        acc[rule.chain].push(rule);
        return acc;
      }, {} as Record<string, Rule[]>);
      
      // 为每个链创建规则节点和连接
      Object.entries(chainRules).forEach(([chain, chainRules]) => {
        const chainPos = chainPositions[chain as keyof typeof chainPositions];
        if (!chainPos) return;
        
        chainRules.forEach((rule, index) => {
          const ruleId = `${table}-${chain}-rule-${index}`;
          const ruleY = chainPos.y + 100 + (index * 80);
          
          // 添加规则节点
          tableNodes.push({
            id: ruleId,
            x: chainPos.x,
            y: ruleY,
            label: `${rule.protocol || 'any'} ${rule.port || ''}`.trim(),
            type: 'rule',
            color: getRuleColor(rule.target)
          });
          
          // 连接链到第一个规则
          if (index === 0) {
            tableConnections.push({
              from: `${table}-${chain}`,
              to: ruleId,
              color: '#666'
            });
          } else {
            // 连接前一个规则到当前规则
            const prevRuleId = `${table}-${chain}-rule-${index - 1}`;
            tableConnections.push({
              from: prevRuleId,
              to: ruleId,
              color: '#666'
            });
          }
          
          // 根据目标添加最终连接
          if (rule.target === 'ACCEPT') {
            if (chain === 'INPUT') {
              tableConnections.push({
                from: ruleId,
                to: `${table}-local`,
                label: 'ACCEPT',
                color: '#4CAF50'
              });
            } else if (chain === 'OUTPUT') {
              tableConnections.push({
                from: ruleId,
                to: `${table}-internet`,
                label: 'ACCEPT',
                color: '#4CAF50'
              });
            }
          } else if (rule.target === 'DROP' || rule.target === 'REJECT') {
            tableConnections.push({
              from: ruleId,
              to: `${table}-internet`,
              label: rule.target,
              color: '#F44336',
              dashed: true
            });
          } else if (rule.target === 'SNAT' || rule.target === 'DNAT' || rule.target === 'MASQUERADE') {
            // NAT 规则的特殊处理
            tableConnections.push({
              from: ruleId,
              to: `${table}-internet`,
              label: rule.target,
              color: '#FF5722'
            });
          }
        });
      });
      
      // 添加外部到内部的连接
      tableConnections.push({
        from: `${table}-internet`,
        to: `${table}-INPUT`,
        label: 'Incoming',
        color: '#FF9800'
      });
      
      tableConnections.push({
        from: `${table}-OUTPUT`,
        to: `${table}-internet`,
        label: 'Outgoing',
        color: '#FF9800'
      });
      
      // 为 NAT 表添加特殊连接
      if (table === 'nat') {
        tableConnections.push({
          from: `${table}-internet`,
          to: `${table}-PREROUTING`,
          label: 'NAT In',
          color: '#E91E63'
        });
        
        tableConnections.push({
          from: `${table}-POSTROUTING`,
          to: `${table}-internet`,
          label: 'NAT Out',
          color: '#E91E63'
        });
      }
      
      tableGroups[table] = { nodes: tableNodes, connections: tableConnections };
      nodes.push(...tableNodes);
      connections.push(...tableConnections);
    });
    
    return { nodes, connections, tableGroups };
  }, [rules]);
  
  const renderNode = (node: Node) => {
    const radius = node.type === 'chain' ? 30 : node.type === 'endpoint' ? 25 : 20;
    const fontSize = node.type === 'chain' ? 12 : node.type === 'endpoint' ? 10 : 8;
    
    return (
      <g key={node.id}>
        <circle
          cx={node.x}
          cy={node.y}
          r={radius}
          fill={node.color}
          stroke="#333"
          strokeWidth="2"
        />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          fontSize={fontSize}
          fill="white"
          fontWeight="bold"
        >
          {node.label}
        </text>
      </g>
    );
  };
  
  const renderConnection = (conn: Connection) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    if (!fromNode || !toNode) return null;
    
    const strokeDasharray = conn.dashed ? "5,5" : undefined;
    
    return (
      <g key={`${conn.from}-${conn.to}`}>
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke={conn.color}
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
          markerEnd="url(#arrowhead)"
        />
        {conn.label && (
          <text
            x={(fromNode.x + toNode.x) / 2}
            y={(fromNode.y + toNode.y) / 2 - 5}
            textAnchor="middle"
            fontSize="10"
            fill={conn.color}
            fontWeight="bold"
          >
            {conn.label}
          </text>
        )}
      </g>
    );
  };
  
  if (rules.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          请输入 iptables 规则以查看可视化图表
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          网络流量可视化
        </Typography>
        <Box sx={{ width: '100%', height: 'calc(100% - 60px)', border: '1px solid #ddd', borderRadius: 1 }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${Math.max(900, Object.keys(tableGroups).length * 800)} 700`}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#333"
                />
              </marker>
            </defs>
            
            {/* 渲染连接线 */}
            {connections.map(renderConnection)}
            
            {/* 渲染节点 */}
            {nodes.map(renderNode)}
            
            {/* 添加图例 - 移到右下角 */}
            <g>
              <rect x="680" y="550" width="200" height="160" fill="white" stroke="#ccc" strokeWidth="1" rx="5"/>
              <text x="690" y="570" fontSize="12" fontWeight="bold" fill="#333">图例</text>
              
              <circle cx="695" cy="590" r="8" fill="#2196F3"/>
              <text x="710" y="595" fontSize="10" fill="#333">链 (Chain)</text>
              
              <circle cx="695" cy="610" r="6" fill="#4CAF50"/>
              <text x="710" y="615" fontSize="10" fill="#333">ACCEPT 规则</text>
              
              <circle cx="695" cy="630" r="6" fill="#F44336"/>
              <text x="710" y="635" fontSize="10" fill="#333">DROP/REJECT 规则</text>
              
              <circle cx="695" cy="650" r="6" fill="#FF5722"/>
              <text x="710" y="655" fontSize="10" fill="#333">NAT 规则</text>
              
              <circle cx="695" cy="670" r="8" fill="#FF9800"/>
              <text x="710" y="675" fontSize="10" fill="#333">网络端点</text>
              
              <circle cx="695" cy="690" r="8" fill="#9C27B0"/>
              <text x="710" y="695" fontSize="10" fill="#333">表标题</text>
            </g>
          </svg>
        </Box>
      </Paper>
    </Box>
  );
};

export default IptablesVisualization;
