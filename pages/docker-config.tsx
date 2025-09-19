import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  FormControlLabel, 
  Switch, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Tabs, 
  Tab, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails 
} from '@mui/material';
import Editor from '@monaco-editor/react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TopNav from '../src/TopNav';

interface DockerConfig {
  debug?: boolean;
  host?: string[];
  tls?: boolean;
  tlscert?: string;
  tlskey?: string;
  tlsverify?: boolean;
  'api-cors-header'?: string;
  'authorization-plugins'?: string[];
  'bip'?: string;
  'bridge'?: string;
  'cgroup-parent'?: string;
  'cluster-store'?: string;
  'cluster-advertise'?: string;
  'data-root'?: string;
  'default-gateway'?: string;
  'default-gateway-v6'?: string;
  'default-runtime'?: string;
  'default-shm-size'?: string;
  'dns'?: string[];
  'dns-opts'?: string[];
  'dns-search'?: string[];
  'exec-opts'?: string[];
  'experimental'?: boolean;
  'features'?: Record<string, boolean>;
  'fixed-cidr'?: string;
  'fixed-cidr-v6'?: string;
  'group'?: string;
  'icc'?: boolean;
  'init'?: boolean;
  'init-path'?: string;
  'ip'?: string;
  'ip-forward'?: boolean;
  'ip-masq'?: boolean;
  'iptables'?: boolean;
  'ipv6'?: boolean;
  'labels'?: string[];
  'live-restore'?: boolean;
  'log-driver'?: string;
  'log-level'?: string;
  'log-opts'?: Record<string, string>;
  'max-concurrent-downloads'?: number;
  'max-concurrent-uploads'?: number;
  'mtu'?: number;
  'oom-score-adjust'?: number;
  'pidfile'?: string;
  'raw-logs'?: boolean;
  'registry-mirrors'?: string[];
  'insecure-registries'?: string[];
  'runtimes'?: Record<string, { path: string; runtimeArgs?: string[] }>;
  'selinux-enabled'?: boolean;
  'storage-driver'?: string;
  'storage-opts'?: string[];
  'swarm-default-advertise-addr'?: string;
  'tls-ca-cert'?: string;
  'tls-ca-key'?: string;
  'tls-client-cert'?: string;
  'tls-client-key'?: string;
  'tls-server-cert'?: string;
  'tls-server-key'?: string;
  'userns-remap'?: string;
  'userland-proxy'?: boolean;
  'userland-proxy-path'?: string;
  [key: string]: any;
}

const DockerConfigGen = () => {
  // 基本配置
  const [debug, setDebug] = useState(false);
  const [host, setHost] = useState('unix:///var/run/docker.sock');
  const [tls, setTls] = useState(false);
  const [tlscert, setTlscert] = useState('');
  const [tlskey, setTlskey] = useState('');
  const [tlsverify, setTlsverify] = useState(false);
  const [dataRoot, setDataRoot] = useState('');
  const [storageDriver, setStorageDriver] = useState('');
  const [storageOpts, setStorageOpts] = useState('');
  const [registryMirrors, setRegistryMirrors] = useState('');
  const [insecureRegistries, setInsecureRegistries] = useState('');
  const [ipv6, setIpv6] = useState(false);
  const [fixedCidr, setFixedCidr] = useState('');
  const [fixedCidrV6, setFixedCidrV6] = useState('');
  const [bip, setBip] = useState('');
  const [logDriver, setLogDriver] = useState('json-file');
  const [logLevel, setLogLevel] = useState('info');
  const [logOptsMaxSize, setLogOptsMaxSize] = useState('10m');
  const [logOptsMaxFile, setLogOptsMaxFile] = useState('3');
  const [maxConcurrentDownloads, setMaxConcurrentDownloads] = useState(3);
  const [maxConcurrentUploads, setMaxConcurrentUploads] = useState(5);
  const [experimental, setExperimental] = useState(false);
  const [liveRestore, setLiveRestore] = useState(false);
  
  // 高级配置
  const [execOpts, setExecOpts] = useState('');
  const [dns, setDns] = useState('');
  const [dnsSearch, setDnsSearch] = useState('');
  const [dnsOpts, setDnsOpts] = useState('');
  const [userlandProxy, setUserlandProxy] = useState(true);
  const [iptables, setIptables] = useState(true);
  const [icc, setIcc] = useState(true);
  const [ipForward, setIpForward] = useState(true);
  const [ipMasq, setIpMasq] = useState(true);
  const [mtu, setMtu] = useState(0);
  
  // UI状态
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // 生成配置JSON
  const generateConfig = (): DockerConfig => {
    const config: DockerConfig = {};
    
    if (debug) config.debug = debug;
    if (host && host.trim()) config.host = host.split(',').map(h => h.trim());
    if (tls) config.tls = tls;
    if (tlscert && tlscert.trim()) config.tlscert = tlscert;
    if (tlskey && tlskey.trim()) config.tlskey = tlskey;
    if (tlsverify) config.tlsverify = tlsverify;
    if (dataRoot && dataRoot.trim()) config['data-root'] = dataRoot;
    if (storageDriver && storageDriver.trim()) config['storage-driver'] = storageDriver;
    if (storageOpts && storageOpts.trim()) config['storage-opts'] = storageOpts.split(',').map(opt => opt.trim());
    if (registryMirrors && registryMirrors.trim()) config['registry-mirrors'] = registryMirrors.split(',').map(mirror => mirror.trim());
    if (insecureRegistries && insecureRegistries.trim()) config['insecure-registries'] = insecureRegistries.split(',').map(registry => registry.trim());
    if (ipv6) config.ipv6 = ipv6;
    if (fixedCidr && fixedCidr.trim()) config['fixed-cidr'] = fixedCidr;
    if (fixedCidrV6 && fixedCidrV6.trim()) config['fixed-cidr-v6'] = fixedCidrV6;
    if (bip && bip.trim()) config.bip = bip;
    if (logDriver && logDriver.trim()) config['log-driver'] = logDriver;
    if (logLevel && logLevel.trim()) config['log-level'] = logLevel;
    
    // 日志选项
    const logOpts: Record<string, string> = {};
    if (logOptsMaxSize && logOptsMaxSize.trim()) logOpts['max-size'] = logOptsMaxSize;
    if (logOptsMaxFile && logOptsMaxFile.trim()) logOpts['max-file'] = logOptsMaxFile;
    if (Object.keys(logOpts).length > 0) config['log-opts'] = logOpts;
    
    if (maxConcurrentDownloads > 0) config['max-concurrent-downloads'] = maxConcurrentDownloads;
    if (maxConcurrentUploads > 0) config['max-concurrent-uploads'] = maxConcurrentUploads;
    if (experimental) config.experimental = experimental;
    if (liveRestore) config['live-restore'] = liveRestore;
    
    // 高级配置
    if (execOpts && execOpts.trim()) config['exec-opts'] = execOpts.split(',').map(opt => opt.trim());
    if (dns && dns.trim()) config.dns = dns.split(',').map(d => d.trim());
    if (dnsSearch && dnsSearch.trim()) config['dns-search'] = dnsSearch.split(',').map(d => d.trim());
    if (dnsOpts && dnsOpts.trim()) config['dns-opts'] = dnsOpts.split(',').map(opt => opt.trim());
    if (!userlandProxy) config['userland-proxy'] = userlandProxy;
    if (!iptables) config.iptables = iptables;
    if (!icc) config.icc = icc;
    if (!ipForward) config['ip-forward'] = ipForward;
    if (!ipMasq) config['ip-masq'] = ipMasq;
    if (mtu > 0) config.mtu = mtu;
    
    return config;
  };

  // 复制到剪贴板
  const handleCopyToClipboard = () => {
    const config = generateConfig();
    const jsonString = JSON.stringify(config, null, 2);
    
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  // 渲染配置表单
  const renderConfigForm = () => (
    <div>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="基本配置" />
        <Tab label="网络配置" />
        <Tab label="高级配置" />
      </Tabs>
      
      {/* 基本配置 */}
      {activeTab === 0 && (
        <div>
          <FormControlLabel
            control={<Switch checked={debug} onChange={(e) => setDebug(e.target.checked)} />}
            label="Debug模式"
          />
          
          <TextField
            fullWidth
            label="主机地址"
            variant="outlined"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            margin="normal"
            helperText="多个地址用逗号分隔，如: unix:///var/run/docker.sock, tcp://0.0.0.0:2375"
          />
          
          <div style={{ marginBottom: '16px' }}>
            <Typography variant="subtitle1" gutterBottom>TLS配置</Typography>
            <FormControlLabel
              control={<Switch checked={tls} onChange={(e) => setTls(e.target.checked)} />}
              label="启用TLS"
            />
            
            {tls && (
              <>
                <TextField
                  fullWidth
                  label="TLS证书路径"
                  variant="outlined"
                  value={tlscert}
                  onChange={(e) => setTlscert(e.target.value)}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="TLS密钥路径"
                  variant="outlined"
                  value={tlskey}
                  onChange={(e) => setTlskey(e.target.value)}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={<Switch checked={tlsverify} onChange={(e) => setTlsverify(e.target.checked)} />}
                  label="验证TLS"
                />
              </>
            )}
          </div>
          
          <TextField
            fullWidth
            label="数据根目录"
            variant="outlined"
            value={dataRoot}
            onChange={(e) => setDataRoot(e.target.value)}
            margin="normal"
            helperText="默认为/var/lib/docker"
          />
          
          <TextField
            fullWidth
            label="存储驱动"
            variant="outlined"
            value={storageDriver}
            onChange={(e) => setStorageDriver(e.target.value)}
            margin="normal"
            helperText="如: overlay2, aufs, btrfs等"
          />
          
          <TextField
            fullWidth
            label="存储选项"
            variant="outlined"
            value={storageOpts}
            onChange={(e) => setStorageOpts(e.target.value)}
            margin="normal"
            helperText="多个选项用逗号分隔"
          />
          
          <TextField
            fullWidth
            label="镜像加速器"
            variant="outlined"
            value={registryMirrors}
            onChange={(e) => setRegistryMirrors(e.target.value)}
            margin="normal"
            helperText="多个镜像加速器用逗号分隔"
          />
          
          <TextField
            fullWidth
            label="不安全仓库地址"
            variant="outlined"
            value={insecureRegistries}
            onChange={(e) => setInsecureRegistries(e.target.value)}
            margin="normal"
            helperText="多个不安全仓库地址用逗号分隔，例如: 192.168.1.100:5000, registry.mycompany.com"
          />
        </div>
      )}
      
      {/* 网络配置 */}
      {activeTab === 1 && (
        <div>
          <FormControlLabel
            control={<Switch checked={ipv6} onChange={(e) => setIpv6(e.target.checked)} />}
            label="启用IPv6"
          />
          
          {ipv6 && (
            <>
              <TextField
                fullWidth
                label="IPv4子网"
                variant="outlined"
                value={fixedCidr}
                onChange={(e) => setFixedCidr(e.target.value)}
                margin="normal"
                helperText="如: 172.17.0.0/16"
              />
              
              <TextField
                fullWidth
                label="IPv6子网"
                variant="outlined"
                value={fixedCidrV6}
                onChange={(e) => setFixedCidrV6(e.target.value)}
                margin="normal"
                helperText="如: 2001:db8::/64"
              />
            </>
          )}
          
          <TextField
            fullWidth
            label="桥接IP范围"
            variant="outlined"
            value={bip}
            onChange={(e) => setBip(e.target.value)}
            margin="normal"
            helperText="如: 172.17.0.1/16"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>日志驱动</InputLabel>
            <Select
              value={logDriver}
              label="日志驱动"
              onChange={(e) => setLogDriver(e.target.value)}
            >
              <MenuItem value="json-file">json-file</MenuItem>
              <MenuItem value="syslog">syslog</MenuItem>
              <MenuItem value="journald">journald</MenuItem>
              <MenuItem value="gelf">gelf</MenuItem>
              <MenuItem value="fluentd">fluentd</MenuItem>
              <MenuItem value="awslogs">awslogs</MenuItem>
              <MenuItem value="splunk">splunk</MenuItem>
              <MenuItem value="none">none</MenuItem>
            </Select>
          </FormControl>
          
          {logDriver === 'json-file' && (
            <>
              <TextField
                fullWidth
                label="最大日志文件大小"
                variant="outlined"
                value={logOptsMaxSize}
                onChange={(e) => setLogOptsMaxSize(e.target.value)}
                margin="normal"
                helperText="如: 10m"
              />
              
              <TextField
                fullWidth
                label="最大日志文件数"
                variant="outlined"
                value={logOptsMaxFile}
                onChange={(e) => setLogOptsMaxFile(e.target.value)}
                margin="normal"
                helperText="如: 3"
              />
            </>
          )}
          
          <FormControl fullWidth margin="normal">
            <InputLabel>日志级别</InputLabel>
            <Select
              value={logLevel}
              label="日志级别"
              onChange={(e) => setLogLevel(e.target.value)}
            >
              <MenuItem value="debug">debug</MenuItem>
              <MenuItem value="info">info</MenuItem>
              <MenuItem value="warn">warn</MenuItem>
              <MenuItem value="error">error</MenuItem>
              <MenuItem value="fatal">fatal</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}
      
      {/* 高级配置 */}
      {activeTab === 2 && (
        <div>
          <TextField
            fullWidth
            label="执行选项"
            variant="outlined"
            value={execOpts}
            onChange={(e) => setExecOpts(e.target.value)}
            margin="normal"
            helperText="多个选项用逗号分隔，如: native.cgroupdriver=systemd"
          />
          
          <TextField
            fullWidth
            label="DNS服务器"
            variant="outlined"
            value={dns}
            onChange={(e) => setDns(e.target.value)}
            margin="normal"
            helperText="多个DNS用逗号分隔"
          />
          
          <TextField
            fullWidth
            label="DNS搜索域"
            variant="outlined"
            value={dnsSearch}
            onChange={(e) => setDnsSearch(e.target.value)}
            margin="normal"
            helperText="多个搜索域用逗号分隔"
          />
          
          <TextField
            fullWidth
            label="DNS选项"
            variant="outlined"
            value={dnsOpts}
            onChange={(e) => setDnsOpts(e.target.value)}
            margin="normal"
            helperText="多个选项用逗号分隔"
          />
          
          <FormControlLabel
            control={<Switch checked={userlandProxy} onChange={(e) => setUserlandProxy(e.target.checked)} />}
            label="启用用户空间代理"
          />
          
          <FormControlLabel
            control={<Switch checked={iptables} onChange={(e) => setIptables(e.target.checked)} />}
            label="启用iptables"
          />
          
          <FormControlLabel
            control={<Switch checked={icc} onChange={(e) => setIcc(e.target.checked)} />}
            label="启用容器间通信"
          />
          
          <FormControlLabel
            control={<Switch checked={ipForward} onChange={(e) => setIpForward(e.target.checked)} />}
            label="启用IP转发"
          />
          
          <FormControlLabel
            control={<Switch checked={ipMasq} onChange={(e) => setIpMasq(e.target.checked)} />}
            label="启用IP伪装"
          />
          
          <TextField
            fullWidth
            label="MTU大小"
            variant="outlined"
            type="number"
            value={mtu}
            onChange={(e) => setMtu(Number(e.target.value))}
            margin="normal"
            helperText="0表示使用默认值"
          />
          
          <TextField
            fullWidth
            label="最大并发下载数"
            variant="outlined"
            type="number"
            value={maxConcurrentDownloads}
            onChange={(e) => setMaxConcurrentDownloads(Number(e.target.value))}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="最大并发上传数"
            variant="outlined"
            type="number"
            value={maxConcurrentUploads}
            onChange={(e) => setMaxConcurrentUploads(Number(e.target.value))}
            margin="normal"
          />
          
          <FormControlLabel
            control={<Switch checked={experimental} onChange={(e) => setExperimental(e.target.checked)} />}
            label="启用实验性功能"
          />
          
          <FormControlLabel
            control={<Switch checked={liveRestore} onChange={(e) => setLiveRestore(e.target.checked)} />}
            label="启用现场恢复"
          />
        </div>
      )}
    </div>
  );

  // 渲染JSON预览
  const renderJsonPreview = () => {
    const config = generateConfig();
    const jsonString = JSON.stringify(config, null, 2);
    
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">JSON预览</Typography>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyToClipboard}
          >
            {copied ? '已复制' : '复制到剪贴板'}
          </Button>
        </Box>
        <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={jsonString}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: true,
            }}
          />
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">配置说明</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                生成的配置可以保存为daemon.json文件，放在Docker的配置目录中：<br />
                - Linux: /etc/docker/daemon.json<br />
                - Windows: C:\ProgramData\Docker\config\daemon.json<br />
                - macOS: /etc/docker/daemon.json (通过Docker Desktop的高级设置也可配置)
                <br /><br />
                修改配置后需要重启Docker服务才能生效。
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </div>
    );
  };

  return (
    <div>
      <TopNav />
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Docker Daemon 配置生成器</Typography>
        <Box sx={{ display: 'flex', gap: 2, height: '80vh' }}>
          <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Typography variant="h6" gutterBottom>配置选项</Typography>
            {renderConfigForm()}
          </Paper>
          <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {renderJsonPreview()}
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default DockerConfigGen;