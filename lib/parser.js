// /lib/parser.js

function parseShadowsocksURI(uri, url) {
  try {
    const userInfo = Buffer.from(url.username, 'base64').toString('utf8').split(':');
    const proxy = {
      name: decodeURIComponent(url.hash.substring(1)) || `${url.hostname}:${url.port}`,
      type: 'ss',
      server: url.hostname,
      port: parseInt(url.port, 10),
      cipher: userInfo[0],
      password: userInfo[1],
    };

    const pluginParam = url.searchParams.get('plugin');
    if (pluginParam) {
      const parts = pluginParam.split(';');
      const pluginType = parts[0];
      const opts = {};
      for (let i = 1; i < parts.length; i++) {
        const [key, value] = parts[i].split('=');
        if (key && value) opts[key] = value;
      }

      proxy.plugin = pluginType;
      if (pluginType === 'simple-obfs') {
        proxy['plugin'] = 'obfs';
        proxy['plugin-opts'] = {
          mode: opts.obfs,
          host: opts['obfs-host']
        };
      }
    }
    return proxy;
  } catch (e) {
    console.error(`解析 Shadowsocks 链接失败: ${uri}`, e);
    return null;
  }
}

function parseVmessURI(uri) {
  try {
    const base64Content = uri.substring('vmess://'.length);
    const decoded = Buffer.from(base64Content, 'base64').toString('utf8');
    const vmessConfig = JSON.parse(decoded);

    const proxy = {
      name: vmessConfig.ps || vmessConfig.add,
      type: 'vmess',
      server: vmessConfig.add,
      port: parseInt(vmessConfig.port, 10),
      uuid: vmessConfig.id,
      alterId: parseInt(vmessConfig.aid, 10),
      cipher: 'auto',
      tls: vmessConfig.tls === 'tls',
      network: vmessConfig.net || 'tcp',
    };

    if (proxy.tls) {
      proxy.servername = vmessConfig.sni || vmessConfig.host || vmessConfig.add;
    }

    if (proxy.network === 'ws') {
      proxy['ws-opts'] = {
        path: vmessConfig.path || '/',
        headers: { Host: vmessConfig.host || vmessConfig.add }
      };
    }
    
    if (vmessConfig.type && vmessConfig.type !== 'none') {
        proxy.header = { type: vmessConfig.type };
    }

    return proxy;
  } catch (e) {
    console.error(`解析 Vmess 链接失败: ${uri}`, e);
    return null;
  }
}

// 这就是我们工具箱唯一的出口，一个强大的调度员函数！
function parseUri(uri) {
  if (!uri || typeof uri !== 'string') return null;

  const trimmedUri = uri.trim();
  
  if (trimmedUri.startsWith('ss://')) {
    try {
      const url = new URL(trimmedUri);
      return parseShadowsocksURI(trimmedUri, url);
    } catch (e) {
      console.error(`解析 SS URL 失败: ${trimmedUri}`, e);
      return null;
    }
  }

  if (trimmedUri.startsWith('vmess://')) {
    return parseVmessURI(trimmedUri);
  }

  console.warn(`不支持的 URI 格式: ${trimmedUri}`);
  return null;
}

// 把我们的主函数暴露出去
export { parseUri };
