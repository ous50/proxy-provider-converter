import axios from "axios";

export default async function handler(req, res) {
  const { url, format, lang } = req.query;
  const subName = req.query.subName ? req.query.subName : url.split("/")[2].split(".")[0];
  console.log(`query: ${JSON.stringify(req.query)}`);
  if (url === undefined) {
    res.status(400).send("Missing parameter: url");
    return;
  }

  if (format == ".sgmodule") {
    // Determine subName: use query param, or extract from urlQueryParam, or from requestPath
    // Constructing the absolute script-path:
    const protocol = req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'development' ? 'http' : 'https');
    const host = req.headers['x-forwarded-host'] || req.headers.host;

    // The script-path should be the URL that was requested, but without the .sgmodule suffix.
    // If request was https://domain.com/api/subinfo.sgmodule?url=http://example.com/sub
    // scriptPath should be https://domain.com/api/subinfo?url=http://example.com/sub (preserving query params if needed by the script itself)
    // Or, if the script is *always* just the base path without .sgmodule and without original query params:
    const scriptPathBase = req.url.replace(/\&format\S*/, ""); // e.g., /api/subinfo
    let scriptPath = `${protocol}://${host}${scriptPathBase}`; // Assuming you want to keep the original URL query parameter
    if (subName) {
      scriptPath += `&subName=${subName}`;
    }

    const title = subName || url || `${protocol}://${host}${req.url}`; // Use original URL query for title if present

    const sgmoduleStr = `#!name=${title} 订阅信息
#!desc=获取${title}剩余流量信息以及套餐到期日期
#!category=Subscription Info
#!author=ous50
#!icon=externaldrive.fill.badge.icloud=#007aff
#!script-update-interval=43200

[Panel]
${subName}-Panel = script-name=${subName}-Script, title="${title} 订阅信息", update-interval=43200

[Script]
${subName}-Script = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/modules/Panel/Sub-info/Moore/Sub-info.js,script-update-interval=0,argument=url=${req.query.url}&reset_day=1&title=${title}&icon=externaldrive.fill.badge.icloud=#007aff
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(sgmoduleStr);
    return;
  }
  console.log(`Fetching url: ${url}`);
  let subscriptionUserInfo;
  let userSubscriptionInfoStr;
  try {
    const result = await axios({
      url,
      headers: {
        "User-Agent":
          "clash.meta",
      },
    });
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

      console.log(`Parsed subscription info: ${JSON.stringify(parsedInfo)}`);

      // 提取数值
      const upload = parseInt(parsedInfo.upload || 0);
      const download = parseInt(parsedInfo.download || 0);
      const total = parseInt(parsedInfo.total || 0);
      const used = upload + download;
      const remaining = total - upload - download;
      const expires = parsedInfo.expire ? formatTimestamp(parsedInfo.expire) : "Never";

      // 格式化显示
      const usedStr = formatBytes(used);
      const uploadStr = formatBytes(upload);
      const downloadStr = formatBytes(download);
      const totalStr = formatBytes(total);
      const remainingStr = formatBytes(remaining > 0 ? remaining : 0);

      console.log(`User Subscription Info: ${subscriptionUserInfo}`);

      userSubscriptionInfoStr = (
        `User Subscription Upload: ${uploadStr}\n` +
        `User Subscription Download: ${downloadStr}\n` +
        `User Subscription Used: ${usedStr}\n` +
        `User Subscription Total: ${totalStr}\n` +
        `User Subscription Remaining: ${remainingStr}\n` +
        `User Subscription Expires: ${expires}\n`);
      console.log(userSubscriptionInfoStr);
    }

  } catch (error) {
    res.status(400).send(`Unable to get url, error: ${error}`);
    return;
  }

  let response = `Subscription URL: ${url}\n` + userSubscriptionInfoStr;

  if (subName) response = `Subscription name: ${subName}\n` + response;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('subscription-userinfo', `${subscriptionUserInfo}`);
  res.status(200).send(response);
};
