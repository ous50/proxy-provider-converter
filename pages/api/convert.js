import YAML from "yaml";
import axios from "axios";
import crypto from "crypto";

export default async function handler(req, res) {
  const url = req.query.url;
  const target = req.query.target;
  const subName = req.query.subName;
  const removeSubInfo = req.query.removeSubInfo ? true : false;
  const displaySubInfo = req.query.displaySubInfo ? true : false;
  const tfo = req.query.tfo ? true : false;
  if (target !== "clash" && target !== "surge") {
    res.status(400).send("Invalid target, only support clash or surge");
    return;
  }
  const lang = req.query.lang || "zh-CN";
  let removeSubInfoFlag = false;
  if (removeSubInfo === "true" || removeSubInfo === true) {
    removeSubInfoFlag = true;
  }
  console.log(`query: ${JSON.stringify(req.query)}`);
  console.log({ "subName": subName, "removeSubInfo": removeSubInfo, "displaySubInfo": displaySubInfo, "tfo": tfo, "target": target });
  if (url === undefined) {
    res.status(400).send("Missing parameter: url");
    return;
  }

  console.log(`Fetching url: ${url}`);
  let configFile;
  let subscriptionUserInfo;
  let subscriptionUserUpload;
  let subscriptionUserDownload;
  let subscriptionUserTotal;
  let subscriptionUserRemaining;
  let subscriptionUserExpires;
  let subscriptionUserUsed;
  try {
    const result = await axios({
      url,
      headers: {
        "User-Agent":
          "clash.meta",
      },
    });
    configFile = result.data;
    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

      // 计算合适的单位
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function formatTimestamp(timestamp) {
      if (!timestamp || isNaN(timestamp)) return "Never";
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString("zh-CN");
    }
    // 获取订阅信息
    subscriptionUserInfo = result.headers["subscription-userinfo"];
    if (subscriptionUserInfo) {
      // 解析信息
      const parts = subscriptionUserInfo.split(';');
      const parsedInfo = {};

      parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          parsedInfo[key.trim()] = value.trim();
        }
      });

      // 提取数值
      const upload = parseInt(parsedInfo.upload || 0);
      const download = parseInt(parsedInfo.download || 0);
      const total = parseInt(parsedInfo.total || 0);
      const used = upload + download;
      const remaining = total - upload - download;
      const expires = parsedInfo.expire ? formatTimestamp(parsedInfo.expire) : "Never";
      subscriptionUserExpires = expires;

      // 格式化显示
      const usedStr = formatBytes(used);
      subscriptionUserUsed = usedStr;
      const uploadStr = formatBytes(upload);
      subscriptionUserUpload = uploadStr;
      const downloadStr = formatBytes(download);
      subscriptionUserDownload = downloadStr;
      const totalStr = formatBytes(total);
      subscriptionUserTotal = totalStr;
      const remainingStr = formatBytes(remaining > 0 ? remaining : 0);
      subscriptionUserRemaining = remainingStr;

      console.log(`User Subscription Info: ${subscriptionUserInfo}`);
      console.log(`    User Subscription Upload: ${uploadStr}
    User Subscription Download: ${downloadStr}
    User Subscription Used: ${usedStr}
    User Subscription Total: ${totalStr}
    User Subscription Remaining: ${remainingStr}
    User Subscription Expires: ${expires}`);
    }

  } catch (error) {
    res.status(400).send(`Unable to get url, error: ${error}`);
    return;
  }



  console.log(`Parsing YAML`);
  let config;
  try {
    config = YAML.parse(configFile);
    console.log(`👌 Parsed YAML`);
  } catch (error) {
    res.status(500).send(`Unable parse config, error: ${error}`);
    return;
  }

  if (config.proxies === undefined) {
    res.status(400).send("No proxies in this config");
    return;
  }

  /**
   * This function tags the proxy item with subscription info if available.
   * Afterwards, the convertion script will remove the subscription info from the proxy name if removeSubInfo is passed.
   * @param {*} proxy - The proxy item to be examined.
   * @returns {void}
   */
  function tagSubinfoProxyItem(proxy) {
    const expiryNameList = ["Expire", "Expires", "Expiry", "过期", "到期", "有效期", "過期"];
    const trafficNameList = ["Traffic", "流量", "流量剩余", "剩余流量", "剩余"];
    const officialNameList = ["Official", "官方", "官网", "官網"];

    for (let i = 0; i < expiryNameList.length; i++) {
      if (proxy.name.includes(expiryNameList[i])) {
        console.log(`Found expiry info from the proxy name: ${proxy.name}`);
        removeSubInfoFlag = true;
        continue
      }
    }
    for (let i = 0; i < trafficNameList.length; i++) {
      if (proxy.name.includes(trafficNameList[i])) {
        console.log(`Found traffic info from the proxy name: ${proxy.name}`);
        removeSubInfoFlag = true;
        continue
      }
    }
    for (let i = 0; i < officialNameList.length; i++) {
      if (proxy.name.includes(officialNameList[i])) {
        console.log(`Found official info from the proxy name: ${proxy.name}`);
        removeSubInfoFlag = true;
        continue
      }
    }
  }



  if (target === "surge") {
    const supportedProxies = config.proxies.filter((proxy) =>
      ["ss", "vmess", "trojan", "hysteria2", "tuic", "snell"].includes(proxy.type)
    );
    const surgeProxies = supportedProxies.map((proxy) => {
      let common = ``;
      if (removeSubInfo) {
        tagSubinfoProxyItem(proxy);
        // Remove the subscription info proxy item from the proxy list
        if (removeSubInfoFlag) {
          console.log(`Removing subscription info from the proxy named: ${proxy.name}`);
          removeSubInfoFlag = false;
          return;
        }
      }
      if (subName && subName) {
        // console.log(`Subscription name detected, Adding to list.`);
        common = `${proxy.name} - ${subName} = ${proxy.type}, ${proxy.server}, ${proxy.port}`;
      } else {
        // console.log(`Subscription name not detected, Adding to list.`);
        common = `${proxy.name} = ${proxy.type}, ${proxy.server}, ${proxy.port}`;
      }
      // const common = `${proxy.name} = ${proxy.type}, ${proxy.server}, ${proxy.port}`;
      let result = `${common}`;
      if (!proxy.network) proxy.network = "tcp";
      if (proxy.network !== "ws" && proxy.network !== "tcp" && proxy.network !== "http") {
        console.log(
          `Skip convert proxy ${proxy.name} because Surge probably doesn't support ${proxy.network}`
        );
        return;
      }
      switch (proxy.type) {
        case "ss":
          // ProxySS = ss, example.com, 2021, encrypt-method=xchacha20-ietf-poly1305, password=12345, obfs=http, obfs-host=example.com, udp-relay=true
          if (proxy.plugin === "v2ray-plugin") {
            console.log(
              `Skip convert proxy ${proxy.name} because Surge does not support Shadowsocks with v2ray-plugin`
            );
            return;
          }
          result = `${common}, encrypt-method=${proxy.cipher}, password=${proxy.password}`;
          if (proxy.plugin === "obfs") {
            const mode = proxy?.["plugin-opts"].mode;
            const host = proxy?.["plugin-opts"].host;
            result = `${result}, obfs=${mode}${host ? `, obfs-host=${host}` : ""
              }`;
          }
          break;
        case "vmess":
          // ProxyVmess = vmess, example.com, 2021, username=0233d11c-15a4-47d3-ade3-48ffca0ce119, skip-cert-verify=true, sni=example.com, tls=true, ws=true, ws-path=/path, ws-headers="Host: example.com", vmess-aead=true, encryption-method=(chacha20-ietf-poly1305|aes-128-gcm)
          if (["h2", "http", "grpc"].includes(proxy.network)) {
            console.log(
              `Skip convert proxy ${proxy.name} because Surge probably doesn't support Vmess(${proxy.network})`
            );
            return;
          }
          result = `${common}, username=${proxy.uuid}`;

          if (proxy.alterId === 0) {
            result = `${result}, vmess-aead=true`;
          }
          if (proxy.cipher === "aes-128-gcm" || proxy.cipher === "chacha20-ietf-poly1305") {
            result = `${result}, encryption-method=${proxy.cipher}`;
          }
          if (proxy.cipher === "auto") {
            result = `${result}, encryption-method=aes-128-gcm`;
          }
          break;
        case "trojan":
          // ProxyTrojan = trojan, example.com, 2021, username=user, password=12345, skip-cert-verify=true, sni=example.com
          if (["h2", "http", "grpc"].includes(proxy.network)) {
            console.log(
              `Skip convert proxy ${proxy.name} because Surge probably doesn't support Trojan(${proxy.network})`
            );
            return;
          }
          result = `${common}, password=${proxy.password}`;
          break;
        case "hysteria2":
          // ProxyHysteria = hysteria, example.com, 2021, port-hopping="1234;5000-6000;7044;8000-9000", password=pwd, password=12345, skip-cert-verify=true, sni=example.com, server-cert-fingerprint-sha256=, download-bandwidth=200  ; download-bandwidth is in Mbps
          if (proxy["obfs"] === "salamander") {
            console.log(
              `Skip convert proxy ${proxy.name} because Surge does not support Hysteria2 with obfs`
            );
            return;
          }
          result = `${common}, password=${proxy.password}`;
          if (proxy["port-hopping"]) {
            // port-hopping="1234;5000-6000;7044;8000-9000", converted from ports="1234/5000-6000/7044/8000-9000" or ports="1234,5000-6000,7044,8000-9000"
            const portHopping = proxy["port-hopping"].replace(/(\/|,)/g, ";")
            result = `${result}, port-hopping="${portHopping}"`;
          }
          break;
        case "tuic":
          // ProxyTuic = tuic, example.com, 2021, token=token, alpn=h3;h2;http/1.1, skip-cert-verify=true, sni=example.com
          // ProxyTuicV5 = tuic-v5, example.com, 2021, uuid=uuid, token=token, alpn=h3;h2;http/1.1, skip-cert-verify=true, sni=example.com
          result = `${proxy.name}`;
          // Skip convertion if both token and uuid are set
          if (proxy["token"] && proxy["uuid"]) {
            console.log(
              `Skip convert proxy ${proxy.name} because both token and uuid are set`
            );
            return;
          } else if (proxy["token"]) {
            result = `${proxy.name} = tuic, ${proxy.server}, ${proxy.port},token=${proxy.token}`;
          } else if (proxy["uuid"]) {
            result = `${proxy.name} = tuic-v5, ${proxy.server}, ${proxy.port}, uuid=${proxy.uuid}, password=${proxy.password}`;
          } else {
            console.log(
              `Skip convert proxy ${proxy.name} because Surge does not support Tuic without token`
            );
            return;
          }
          break;
        case "snell":
          // Clash only supports snell from v1-v3, v4 is not supported
          //Proxy-Snell = snell, 1.2.3.4, 8000, psk=password, version=3, obfs=(http|tls), obfs-host=example.com
          result = `${common}, psk=${proxy.psk}, version=${proxy.version}`;
          if (proxy["obfs-opts"].mode) {
            result = `${result}, obfs=${proxy["obfs-opts"].mode}`;
          }
          if (proxy["obfs-opts"].host) {
            result = `${result}, obfs-host=${proxy["obfs-opts"].host}`;
          }
          break;
      }

      // IP version
      if (proxy["ip-version"]) {
        switch (proxy["ip-version"]) {
          case "ipv4":
            result = `${result}, ip-version=ipv4`;
            break;
          case "ipv6":
            result = `${result}, ip-version=ipv6`;
            break;
          case "ipv4-prefer":
            result = `${result}, ip-version=ipv4-prefer`;
            break;
          case "ipv6-prefer":
            result = `${result}, ip-version=ipv6-prefer`;
            break;
          default:
            break;
        }
      }

      //  TLS part 
      if (proxy.tls === true || proxy["disable-sni"] === false) {
        result = `${result}, tls=true, sni=(${proxy.servername}||${proxy.sni}||${proxy.server})`;
        if (proxy["skip-cert-verify"]) {
          result = `${result}, skip-cert-verify=${proxy["skip-cert-verify"]}`;
        }
        if (proxy.fingerprint) {
          fingerprintSha256 = crypto.createHash("sha256").update(proxy.fingerprint).digest("hex");
          result = `${result}, server-cert-fingerprint-sha256=${fingerprintSha256}`;
        }
        if (proxy["alpn"]) {
          // convert alpn from array to string like: h3;h2;http/1.1
          if (Array.isArray(proxy["alpn"])) {
            result = `${result}, alpn=${proxy["alpn"].join(";")}`;
          } else {
            result = `${result}, alpn=${proxy["alpn"]}`;
          }
        }

      }

      //  WS part
      if (proxy.network === "ws") {
        result = `${result}, ws=true`;
        if (proxy["ws-opts"]) {
          if (proxy["ws-opts"].path) {
            result = `${result}, ws-path=${proxy["ws-opts"].path}`;
          }
          if (proxy["ws-opts"].headers) {
            result = `${result}, ws-headers="${proxy["ws-opts"].headers}"`;
          }
        }
      }
      //  UDP 
      if (proxy.udp === true || req.query.udp === true) {
        result = `${result}, udp-relay=true`;
      }
      // TCP Fast Open
      if (proxy["fast-open"] === true || proxy.tfo === true || tfo === true) {
        result = `${result}, tfo=true`;
      }
      // console.log(`Converted proxy: ${result}`);
      return result ? result : undefined;
    });
    const proxies = surgeProxies.filter((p) => p !== undefined);
    if (proxies.length === 0) {
      res.status(400).send("No supported proxies in this config");
      return;
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    // res.setHeader('subscription-userinfo', `${subscriptionUserInfo}`);
    res.status(200).send(
      `# Subscription URL: ${url}\n` +
      proxies.join("\n")
    );
  } else if (target === "clash") {
    // if (removeSubInfo) {
    //   tagSubinfoProxyItem(proxy);
    //   // Remove the subscription info proxy item from the proxy list
    //   if (removeSubInfoFlag) {
    //     console.log(`Removing subscription info from the proxy named: ${proxy.name}`);
    //     removeSubInfoFlag = false;
    //     return;
    //   }
    // }
    if (removeSubInfo) {
      for (let i = 0; i < config.proxies.length; i++) {
        const proxy = config.proxies[i];
        tagSubinfoProxyItem(proxy);
        // Remove the subscription info proxy item from the proxy list
        if (removeSubInfoFlag) {
          console.log(`Removing subscription info from the proxy named: ${proxy.name}`);
          removeSubInfoFlag = false;
          config.proxies.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
    }
    if (subName) {
      for (let i = 0; i < config.proxies.length; i++) {
        const proxy = config.proxies[i];
        // console.log(`Subscription name detected, Adding to list.`);
        proxy.name = `${proxy.name} - ${subName}`;
      }
    }
    if (tfo) {
      for (let i = 0; i < config.proxies.length; i++) {
        const proxy = config.proxies[i];
        if (proxy.tfo !== true || proxy["fast-open"] !== true) {
          // console.log(`TCP Fast Open detected, Adding to list.`);
          proxy.tfo = true;
        }
      }
    }
    const response = YAML.stringify({ proxies: config.proxies });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('subscription-userinfo', `${subscriptionUserInfo}`);
    res.status(200).send(`# Subscription URL: ${url}\n` + response);
    // res.status(200).send(response);
  } else {
    res.status(502).send("Internal Server Error.");
  }
};
