import axios from "axios";
import { sendSGModuleResponse } from "../../shared-utils/surge_module_generator";

export default async function handler(req, res) {
  const { url, format, lang } = req.query;
  const subName = req.query.subName ? req.query.subName : url.split("/")[2].split(".")[0];
  console.log(`query: ${JSON.stringify(req.query)}`);
  if (url === undefined) {
    res.status(400).send("Missing parameter: url");
    return;
  }

  if (format == ".sgmodule") {
    return sendSGModuleResponse(req, res);
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

