import React, { useMemo, useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, FormControlLabel, Switch, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import TopNav from '../src/TopNav';
import CodeEditor from '../src/CodeEditor';

type Address = { cidr: string };
type Route = { to: string; via: string; metric?: number };
type Nameservers = { addresses: string; search?: string };
type Ethernet = {
  name: string;
  dhcp4: boolean;
  dhcp6: boolean;
  addresses: Address[];
  gateway4?: string;
  gateway6?: string;
  nameservers: Nameservers;
  routes: Route[];
};

function generateNetplanYaml(version: number, renderer: 'networkd' | 'NetworkManager', ethernets: Ethernet[]): string {
  const indent = (level: number) => '  '.repeat(level);
  const lines: string[] = [];

  lines.push(`network:`);
  lines.push(`${indent(1)}version: ${version}`);
  lines.push(`${indent(1)}renderer: ${renderer}`);
  lines.push(`${indent(1)}ethernets:`);

  ethernets.forEach((eth) => {
    const key = eth.name || 'eth0';
    lines.push(`${indent(2)}${key}:`);
    lines.push(`${indent(3)}dhcp4: ${eth.dhcp4 ? 'true' : 'false'}`);
    lines.push(`${indent(3)}dhcp6: ${eth.dhcp6 ? 'true' : 'false'}`);

    if (!eth.dhcp4 || !eth.dhcp6) {
      if (eth.addresses.length > 0) {
        lines.push(`${indent(3)}addresses:`);
        eth.addresses.filter(a => a.cidr.trim()).forEach(a => {
          lines.push(`${indent(4)}- ${a.cidr.trim()}`);
        });
      }
      if (eth.gateway4 && eth.gateway4.trim()) {
        lines.push(`${indent(3)}gateway4: ${eth.gateway4.trim()}`);
      }
      if (eth.gateway6 && eth.gateway6.trim()) {
        lines.push(`${indent(3)}gateway6: ${eth.gateway6.trim()}`);
      }
    }

    if ((eth.nameservers.addresses && eth.nameservers.addresses.trim()) || (eth.nameservers.search && eth.nameservers.search.trim())) {
      lines.push(`${indent(3)}nameservers:`);
      if (eth.nameservers.addresses && eth.nameservers.addresses.trim()) {
        const dnsAddrs = eth.nameservers.addresses.split(',').map(s => s.trim()).filter(Boolean);
        if (dnsAddrs.length > 0) {
          lines.push(`${indent(4)}addresses:`);
          dnsAddrs.forEach(addr => lines.push(`${indent(5)}- ${addr}`));
        }
      }
      if (eth.nameservers.search && eth.nameservers.search.trim()) {
        const searches = eth.nameservers.search.split(',').map(s => s.trim()).filter(Boolean);
        if (searches.length > 0) {
          lines.push(`${indent(4)}search:`);
          searches.forEach(s => lines.push(`${indent(5)}- ${s}`));
        }
      }
    }

    if (eth.routes && eth.routes.length > 0) {
      const validRoutes = eth.routes.filter(r => r.to.trim() && r.via.trim());
      if (validRoutes.length > 0) {
        lines.push(`${indent(3)}routes:`);
        validRoutes.forEach(r => {
          lines.push(`${indent(4)}- to: ${r.to.trim()}`);
          lines.push(`${indent(5)}via: ${r.via.trim()}`);
          if (typeof r.metric === 'number' && !Number.isNaN(r.metric)) {
            lines.push(`${indent(5)}metric: ${r.metric}`);
          }
        });
      }
    }
  });

  return lines.join('\n') + '\n';
}

const NetplanPage: React.FC = () => {
  const [version, setVersion] = useState<number>(2);
  const [renderer, setRenderer] = useState<'networkd' | 'NetworkManager'>('networkd');
  const [ethernets, setEthernets] = useState<Ethernet[]>([{
    name: 'eth0',
    dhcp4: true,
    dhcp6: false,
    addresses: [{ cidr: '' }],
    gateway4: '',
    gateway6: '',
    nameservers: { addresses: '', search: '' },
    routes: [],
  }]);
  const [copied, setCopied] = useState(false);

  const yaml = useMemo(() => generateNetplanYaml(version, renderer, ethernets), [version, renderer, ethernets]);

  const updateEthernet = (index: number, partial: Partial<Ethernet>) => {
    setEthernets(prev => prev.map((e, i) => i === index ? { ...e, ...partial } : e));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const addInterface = () => setEthernets(prev => [...prev, { name: `eth${prev.length}`, dhcp4: true, dhcp6: false, addresses: [{ cidr: '' }], gateway4: '', gateway6: '', nameservers: { addresses: '', search: '' }, routes: [] }]);
  const removeInterface = (index: number) => setEthernets(prev => prev.filter((_, i) => i !== index));

  return (
    <div>
      <TopNav />
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Netplan 配置生成器</Typography>
        <Box sx={{ display: 'flex', gap: 2, height: '80vh' }}>
          <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Typography variant="h6" gutterBottom>网络接口配置</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Netplan 版本"
                type="number"
                value={version}
                onChange={(e) => setVersion(Number(e.target.value) || 2)}
                sx={{ width: 160 }}
              />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Renderer"
                value={renderer}
                onChange={(e) => setRenderer((e.target as HTMLInputElement).value as any)}
                sx={{ width: 220 }}
              >
                <option value="networkd">networkd</option>
                <option value="NetworkManager">NetworkManager</option>
              </TextField>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={addInterface}>新增网卡</Button>
            </Box>

            {ethernets.map((eth, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2 }} variant="outlined">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TextField label="网卡名称" value={eth.name} onChange={(e) => updateEthernet(idx, { name: e.target.value })} sx={{ width: 200 }} />
                  <FormControlLabel control={<Switch checked={eth.dhcp4} onChange={(e) => updateEthernet(idx, { dhcp4: e.target.checked })} />} label="DHCPv4" />
                  <FormControlLabel control={<Switch checked={eth.dhcp6} onChange={(e) => updateEthernet(idx, { dhcp6: e.target.checked })} />} label="DHCPv6" />
                  <Tooltip title="删除该网卡">
                    <span>
                      <IconButton color="error" onClick={() => removeInterface(idx)} disabled={ethernets.length === 1}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

                {(!eth.dhcp4 || !eth.dhcp6) && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>静态地址</Typography>
                    {eth.addresses.map((a, aIdx) => (
                      <Box key={aIdx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField fullWidth label="地址/CIDR (如 192.168.1.10/24 或 2001:db8::1/64)" value={a.cidr} onChange={(e) => {
                          const next = [...ethernets];
                          next[idx].addresses[aIdx].cidr = e.target.value;
                          setEthernets(next);
                        }} />
                        <Button variant="text" onClick={() => {
                          const next = [...ethernets];
                          next[idx].addresses.splice(aIdx, 1);
                          if (next[idx].addresses.length === 0) next[idx].addresses.push({ cidr: '' });
                          setEthernets(next);
                        }}>删除</Button>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => {
                      const next = [...ethernets];
                      next[idx].addresses.push({ cidr: '' });
                      setEthernets(next);
                    }}>添加地址</Button>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <TextField label="网关 IPv4" value={eth.gateway4} onChange={(e) => updateEthernet(idx, { gateway4: e.target.value })} />
                      <TextField label="网关 IPv6" value={eth.gateway6} onChange={(e) => updateEthernet(idx, { gateway6: e.target.value })} />
                    </Box>
                  </>
                )}

                <Typography variant="subtitle1" sx={{ mt: 2 }}>DNS</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="DNS服务器，逗号分隔" value={eth.nameservers.addresses} onChange={(e) => {
                    const next = [...ethernets];
                    next[idx].nameservers.addresses = e.target.value;
                    setEthernets(next);
                  }} />
                  <TextField fullWidth label="搜索域，逗号分隔" value={eth.nameservers.search} onChange={(e) => {
                    const next = [...ethernets];
                    next[idx].nameservers.search = e.target.value;
                    setEthernets(next);
                  }} />
                </Box>

                <Typography variant="subtitle1" sx={{ mt: 2 }}>静态路由</Typography>
                {(eth.routes || []).map((r, rIdx) => (
                  <Box key={rIdx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <TextField label="目的网段 (to)" value={r.to} onChange={(e) => {
                      const next = [...ethernets];
                      next[idx].routes[rIdx].to = e.target.value;
                      setEthernets(next);
                    }} sx={{ flex: 1 }} />
                    <TextField label="下一跳 (via)" value={r.via} onChange={(e) => {
                      const next = [...ethernets];
                      next[idx].routes[rIdx].via = e.target.value;
                      setEthernets(next);
                    }} sx={{ flex: 1 }} />
                    <TextField label="Metric(可选)" type="number" value={r.metric ?? ''} onChange={(e) => {
                      const next = [...ethernets];
                      const v = e.target.value;
                      next[idx].routes[rIdx].metric = v === '' ? undefined : Number(v);
                      setEthernets(next);
                    }} sx={{ width: 140 }} />
                    <Button onClick={() => {
                      const next = [...ethernets];
                      next[idx].routes.splice(rIdx, 1);
                      setEthernets(next);
                    }}>删除</Button>
                  </Box>
                ))}
                <Button size="small" onClick={() => {
                  const next = [...ethernets];
                  next[idx].routes.push({ to: '', via: '', metric: undefined });
                  setEthernets(next);
                }}>添加路由</Button>
              </Paper>
            ))}
          </Paper>

          <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">YAML 预览</Typography>
              <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopy}>{copied ? '已复制' : '复制到剪贴板'}</Button>
            </Box>
            <CodeEditor height="100%" language="yaml" value={yaml} readOnly={true} />

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2">
                将内容保存为 <code>/etc/netplan/01-network-manager-all.yaml</code> 或类似文件名，然后执行 <code>sudo netplan apply</code> 生效。
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default NetplanPage;
