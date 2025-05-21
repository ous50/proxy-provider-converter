import Head from "next/head";
import { useState, useEffect, useMemo } from "react"; // 重要的改动：引入 useMemo
import { CopyToClipboard } from "react-copy-to-clipboard";
import { SelectorIcon, DuplicateIcon } from "@heroicons/react/outline";
import toast, { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";


let surgeManualURL =
  "https://manual.nssurge.com/policy-group/policy-including.html";
let clashManualURL =
  "https://wiki.metacubex.one/config/proxy-providers/";

export default function Home() {
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState("clash");
  const [displaySubInfo, setDisplaySubInfo] = useState(false);
  const [removeSubInfo, setRemoveSubInfo] = useState(false);
  const [subName, setSubName] = useState(false);
  const [subNameValue, setSubNameValue] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.origin);
    }
  }, []);

  // 使用 useMemo 来计算 convertedUrl，确保它在依赖项变化时才重新计算
  const convertedUrl = useMemo(() => {
    if (!host || !url.trim()) {
      return "";
    }

    const params = new URLSearchParams();
    params.append("url", url);
    params.append("target", target);


    if (target === "surge") {
      if (displaySubInfo) {
        params.append("displaySubInfo", "true");
      }
      if (removeSubInfo) {
        params.append("removeSubInfo", "true");
      }
    }

    if (subName) {
      params.append("subName", "true");
      if (subNameValue.trim()) {
        params.append("subNameValue", subNameValue);
      }
    }

    return `${host}/api/convert?${params.toString()}`;
  }, [host, url, target, displaySubInfo, removeSubInfo, subName, subNameValue]);

  const urlHost = useMemo(() => {
    if (!url.trim()) return ""; // 如果 url 为空或只有空格，返回空
    try {
      return new URL(url).hostname;
    } catch (error) {
      return "invalid-url-host";
    }
  }, [url]);

  const copiedToast = () =>
    toast("已复制", {
      position: "bottom-center",
    });

  const clashConfig = useMemo(() => {
    if (!url.trim() || !convertedUrl) return "";
    return `# Clash 配置格式

proxy-groups:
  - name: UseProvider
    type: select
    use:
      - ${urlHost || "provider1"} 
    proxies:
      - Proxy
      - DIRECT

proxy-providers:
  ${urlHost || "provider1"}: 
    type: http
    url: ${convertedUrl} 
    interval: 3600
    path: ./${urlHost || "provider1"}.yaml
    health-check:
      enable: true
      interval: 600
      # lazy: true
      url: http://www.gstatic.com/generate_204
`;
  }, [url, convertedUrl, urlHost]);

  const surgeConfig = useMemo(() => {
    if (!url.trim() || !convertedUrl) return "";
    return `# Surge 配置格式

[Proxy Group]
${urlHost || "egroup"} = select, policy-path=${convertedUrl}
`;
  }, [url, convertedUrl, urlHost]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Proxy Provider Converter</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <main className="flex flex-col items-start flex-1 max-w-4xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-start md:items-center md:flex-row">
          <img src="/logo.svg" alt="Logo" className="md:mr-4 h-28" />
          <div>
            <h1 className="text-2xl font-extrabold text-black md:text-5xl">
              Proxy Provider Converter
            </h1>
            <p className="mt-2 md:text-lg text-gray-600">
              一个可以将 Clash 订阅转换成 Proxy Provider 和 External
              Group(Surge) 的工具
            </p>
          </div>
        </div>
        <div className="mt-12 text-gray-900">
          <h3 className="text-lg md:text-xl font-bold">
            什么是 Proxy Provider 和 External Group？
          </h3>
          <p className="mt-2">
            <a
              href={clashManualURL}
              target="_blank" rel="noopener noreferrer" // 增加安全性
              className="text-yellow-600 transition hover:text-yellow-500"
            >
              Proxy Provider
            </a>{" "}
            是 Clash
            的一项功能，可以让用户从指定路径动态加载代理服务器列表。使用这个功能你可以将
            Clash
            订阅里面的代理服务器提取出来，放到你喜欢的配置文件里，也可以将多个
            Clash 订阅里的代理服务器混合到一个配置文件里。External Group 则是
            Proxy Provider 在 Surge 里的叫法，作用是一样的。
          </p>
        </div>
        <div className="w-full text-gray-900 mt-14">
          <h3 className="text-lg md:text-xl font-bold">开始使用</h3>
          <div className="flex w-full gap-4 mt-4 flex-col md:flex-row">
            <input
              className="w-full h-full p-4 text-lg bg-white rounded-lg shadow-sm focus:outline-none"
              placeholder="粘贴 Clash 订阅链接到这里"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="relative">
              <select
                className="w-full md:w-max py-3 pl-4 pr-10 text-lg bg-white rounded-lg shadow-sm appearance-none focus:outline-none"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="clash">转换到 Clash</option>
                <option value="surge">转换到 Surge</option>
              </select>
              <SelectorIcon className="absolute h-6 top-3.5 right-3 text-gray-400" />
            </div>
          </div>

          {/* 启用订阅名称后缀复选框 */}
          <div className="flex items-center w-full gap-2 mt-4">
            <input
              type="checkbox"
              id="subName"
              className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500" // 统一美化一下checkbox
              checked={subName}
              onChange={(e) => setSubName(e.target.checked)}
            />
            <label htmlFor="subName" className="text-sm text-gray-700 select-none">
              启用订阅名称后缀
            </label>
          </div>

          {/* 订阅名称后缀输入框 (条件渲染) */}
          {subName && (
            <div className="w-full mt-4">
              <input
                className="w-full p-4 text-lg bg-white rounded-lg shadow-sm focus:outline-none"
                placeholder="请输入订阅名称后缀 (例如：clash 或 xxcloud)"
                value={subNameValue}
                onChange={(e) => setSubNameValue(e.target.value)}
              />
            </div>
          )}

          {/* Surge特定选项 (条件渲染) */}
          {target === "surge" && (
            <div className="w-full mt-4 space-y-2 md:space-y-0 md:flex md:gap-4">
              <div className="flex items-center gap-2">
                {/* 修改后的 displaySubInfo input */}
                <input
                  type="checkbox"
                  id="displaySubInfo"
                  className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  checked={displaySubInfo}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setDisplaySubInfo(isChecked);
                    if (isChecked) {
                      setRemoveSubInfo(false);
                    }
                  }}
                />
                <label htmlFor="displaySubInfo" className="text-sm text-gray-700 select-none">
                  在列表中加入订阅信息
                </label>
              </div>
              <div className="flex items-center gap-2">
                {/* 修改后的 removeSubInfo input */}
                <input
                  type="checkbox"
                  id="removeSubInfo"
                  className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  checked={removeSubInfo}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setRemoveSubInfo(isChecked);
                    if (isChecked) {
                      setDisplaySubInfo(false);
                    }
                  }}
                />
                <label htmlFor="removeSubInfo" className="text-sm text-gray-700 select-none">
                  在列表中删除订阅信息
                </label>
              </div>
            </div>
          )}

        </div>


        {/* 显示转换后的 URL (条件渲染：确保 url 和 convertedUrl 都有效) */}
        {url.trim() && convertedUrl && (
          <div className="break-all p-3 mt-4 rounded-lg text-gray-100 bg-gray-900 shadow-sm w-full">
            {convertedUrl}
            <CopyToClipboard text={convertedUrl} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400  cursor-pointer  hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>
            </CopyToClipboard>
          </div>
        )}

        {/* 显示配置示例 (条件渲染：确保 url 和 convertedUrl 都有效) */}
        {url.trim() && convertedUrl && (
          <div className="w-full p-4 mt-4 text-gray-100 bg-gray-900 rounded-lg hidden md:block">
            {target !== "surge" && clashConfig && ( // 也判断一下 clashConfig 是否有值
              <pre className="whitespace-pre-wrap">{clashConfig}</pre>
            )}
            {target === "surge" && surgeConfig && ( // 也判断一下 surgeConfig 是否有值
              <pre className="whitespace-pre-wrap">{surgeConfig}</pre>
            )}
            <CopyToClipboard
              text={target === "surge" ? surgeConfig : clashConfig}
              onCopy={() => copiedToast()}
            >
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>
            </CopyToClipboard>
          </div>
        )}

        {/* 部署说明部分 */}
        <div className="w-full text-gray-900 mt-14">
          <h3 className="text-lg md:text-xl font-bold">
            怎么自己部署转换工具？
          </h3>
          <p className="mt-2">
            使用工具时，<span className="font-mono bg-gray-200 px-1 rounded text-sm">{host || "你部署的域名"}</span>{" "}
            的拥有者将会有权限查看到你的订阅地址，如果你不想将这种权限给予他人，
            你可以根据下面步骤零成本部署一个属于你自己的转换工具。
          </p>
          <p className="mt-2">
            前期准备：你需要一个{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 transition hover:text-yellow-500"
            >
              GitHub
            </a>{" "}
            账号。
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>
              1. 点击下方的按钮，通过 Vercel 一键部署：
              <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fous50%2Fproxy-provider-converter" target="_blank" rel="noopener noreferrer" className="inline-block ml-2 align-middle">
                <img src="https://vercel.com/button" alt="Deploy with Vercel" />
              </a>
            </li>
            <li>2. 使用你的 GitHub 账号登录 Vercel。</li>
            <li>3. 按照 Vercel 页面上的提示完成项目的创建和部署流程。</li>
            <li>4. 部署完成后，点击 Vercel 项目面板上的 "Visit" 按钮，就可以访问你专属的转换工具啦！</li>
          </ul>
        </div>

        {/* 资源部分 (保持不变，但可以给链接加上 rel="noopener noreferrer") */}
        <div className="w-full text-gray-900 mt-14">
          <h3 className="text-lg md:text-xl font-bold">资源</h3>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>
              Source Code:{" "}
              <a
                href="https://github.com/ous50/proxy-provider-converter"
                target="_blank" rel="noopener noreferrer"
                className="text-yellow-600 transition hover:text-yellow-500"
              >
                https://github.com/ous50/proxy-provider-converter
              </a>
            </li>
            <li>
              <a
                href={clashManualURL}
                target="_blank" rel="noopener noreferrer"
                className="text-yellow-600 transition hover:text-yellow-500"
              >
                Metacubex(clash) Wiki 中的 Proxy Providers 章节
              </a>
            </li>
            <li>
              <a
                href={surgeManualURL}
                target="_blank" rel="noopener noreferrer"
                className="text-yellow-600 transition hover:text-yellow-500"
              >
                Surge Policy Group 文档
              </a>
            </li>
          </ul>
        </div>
      </main>

      <footer className="w-full p-4 max-w-4xl md:py-8">
        <a
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
          href="https://vercel.com?utm_source=ous50-proxy-provider-converter&utm_campaign=oss" // 建议加上UTM参数
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by
          <img src="/vercel.svg" alt="Vercel Logo" className="h-4 ml-2" />
        </a>
      </footer>

      <Toaster />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

