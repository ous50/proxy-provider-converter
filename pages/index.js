import Head from "next/head";
import { useState, useEffect, useMemo } from "react"; // 重要的改动：引入 useMemo
import { CopyToClipboard } from "react-copy-to-clipboard";
import { SelectorIcon, DuplicateIcon } from "@heroicons/react/outline";
import toast, { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { generateSurgePanelLine, generateSurgeScriptLine, generateFullSgmodule } from "../shared-utils/surge_module_generator.js"; // 引入生成器函数


let surgeManualURL =
  "https://manual.nssurge.com/policy-group/policy-including.html";
let clashManualURL =
  "https://wiki.metacubex.one/config/proxy-providers/";

export default function Home() {
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState("clash");
  const [displaySubInfo, setDisplaySubInfo] = useState(false);
  const [removeSubInfo, setRemoveSubInfo] = useState(false);
  const [enableSubName, setenableSubName] = useState(false);
  const [tfo, setTfo] = useState(false);
  const [subName, setsubName] = useState("");
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

    if (removeSubInfo) {
      params.append("removeSubInfo", "true");
    }

    if (target === "surge") {
      if (displaySubInfo) {
        params.append("displaySubInfo", "true");
      }

    }

    if (enableSubName) {
      if (subName.trim()) {
        params.append("subName", subName);
      }
    }

    if (tfo) {
      params.append("tfo", "true");
    }

    params.append("target", target);

    return `${host}/api/convert?${params.toString()}`;
  }, [host, url, displaySubInfo, removeSubInfo, tfo, subName, target]);

  const subInfoUrl = useMemo(() => {
    if (!host || !url.trim()) {
      return "";
    }

    const params = new URLSearchParams();
    params.append("url", url);

    if (enableSubName) {
      if (subName.trim()) {
        params.append("subName", subName);
      }
    }

    return `${host}/api/subinfo?${params.toString()}`;
  }, [host, url, subName]);

  const subInfoSgModuleUrl = useMemo(() => {
    if (!host || !url.trim()) {
      return "";
    }

    const params = new URLSearchParams();
    params.append("url", url);

    if (enableSubName) {
      if (subName.trim()) {
        params.append("subName", subName);
      }
    }

    return `${host}/api/subinfo.sgmodule?${params.toString()}`;
  }, [host, url, subName]);

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

  const clashConfigProxyGroup = useMemo(() => {
    if (!url.trim() || !convertedUrl) return "";
    return `  - name: UseProvider
    type: select
    use:
      - ${subName || urlHost || "provider1"} 
    proxies:
      - Proxy
      - DIRECT


`;
  }, [url, convertedUrl, urlHost]);

  const clashConfigProxyProvider = useMemo(() => {
    if (!url.trim() || !convertedUrl) return "";
    return `  ${subName || urlHost || "provider1"}: 
    type: http
    url: ${convertedUrl} 
    interval: 3600
    path: ./${subName || urlHost || "provider1"}.yaml
    health-check:
      enable: true
      interval: 600
      # lazy: true
      url: http://www.gstatic.com/generate_204
`;
  }, [url, convertedUrl, urlHost]);

  const clashConfig = "proxy-groups:\n" + clashConfigProxyGroup + "proxy-providers:\n" + clashConfigProxyProvider;

  const surgeConfig = useMemo(() => {
    if (!url.trim() || !convertedUrl) return "";
    return `[Proxy Group]
${subName || urlHost} = select, policy-path=${convertedUrl}
`;
  }, [url, convertedUrl, urlHost]);

  const surgeSubInfoPanelPanel = useMemo(() => {
    if (!url.trim() || !subInfoUrl) return "";
    return `${subName || urlHost}-SubInfo = script-name=${subName || urlHost}-SubInfo, title="${subName || urlHost} 订阅信息", update-interval=43200`
  }, [url, subInfoUrl, urlHost, subName]);


  const surgeSubInfoPanelScript = useMemo(() => {
    if (!url.trim() || !subInfoUrl) return "";
    //     return `${subName || urlHost}-SubInfo = type=generic, timeout=15, script-path=https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/modules/Panel/Sub-info/Moore/Sub-info.js,script-update-interval=0,argument=url=${url}&reset_day=1&title=${subName || urlHost}&icon=externaldrive.fill.badge.icloud=#007aff
    // `}, [url, subInfoUrl, urlHost, subName]);
    return generateSurgeScriptLine({
      scriptName: `${subName || urlHost}-SubInfo`,
      timeout: 15,
      scriptPath: "https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/modules/Panel/Sub-info/Moore/Sub-info.js",
      scriptUpdateInterval: 0,
      argumentString: `url=${url}&title=${subName || urlHost}&icon=externaldrive.fill.badge.icloud=#007aff`
    });
  }, [url, subInfoUrl, urlHost, subName]);

  const surgeSubInfoPanel = `[Panel]\n` + surgeSubInfoPanelPanel + `\n\n` + `[Script]\n` + surgeSubInfoPanelScript

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

            </div>
          )}

          {/* 去除订阅信息复选框 */}
          <div className="flex items-center gap-2 mt-4">
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

          {/* 开启强制添加 tfo 复选框 */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="forceTfo"
              className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              checked={tfo}
              onChange={(e) => setTfo(e.target.checked)}
            />
            <label htmlFor="forceTfo" className="text-sm text-gray-700 select-none">
              强制添加 tfo 参数
            </label>
          </div>

          {/* 启用订阅名称后缀复选框 */}
          <div className="flex items-center w-full gap-2 mt-4">
            <input
              type="checkbox"
              id="enableSubName"
              className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500" // 统一美化一下checkbox
              checked={enableSubName}
              onChange={(e) => setenableSubName(e.target.checked)}
            />
            <label htmlFor="enableSubName" className="text-sm text-gray-700 select-none">
              启用订阅名称（也会将此名称写在节点名称后面）
            </label>
          </div>

          {/* 订阅名称后缀输入框 (条件渲染) */}
          {enableSubName && (
            <div className="w-full mt-4">
              <input
                className="w-full p-4 text-lg bg-white rounded-lg shadow-sm focus:outline-none"
                placeholder="请输入订阅名称 (例如：clash 或 xxcloud)"
                value={subName}
                onChange={(e) => setsubName(e.target.value)}
              />
            </div>
          )}

        </div>


        {/* 显示转换后的 URL (条件渲染：确保 url 和 convertedUrl 都有效) */}
        {url.trim() && convertedUrl && (
          <div className="break-all p-3 mt-4 rounded-lg text-gray-100 bg-gray-900 shadow-sm w-full">
            <span className="text-sm text-gray-400">转换后的链接：</span>
            {convertedUrl}
            <CopyToClipboard text={convertedUrl} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400  cursor-pointer  hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>
            </CopyToClipboard>
          </div>
        )}

        {/* 显示订阅信息 (条件渲染：确保 url 和 subInfoUrl 都有效) */}
        {url.trim() && subInfoUrl && target == "surge" && (
          <div className="break-all p-3 mt-4 rounded-lg text-gray-100 bg-gray-900 shadow-sm w-full">
            <span className="text-sm text-gray-400">订阅信息：</span>
            {subInfoUrl}
            <CopyToClipboard text={subInfoUrl} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>
            </CopyToClipboard>
            <span className="text-sm text-gray-400">订阅信息面板链接：</span>
            {subInfoSgModuleUrl}
            <CopyToClipboard text={subInfoSgModuleUrl} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>
            </CopyToClipboard>
          </div>
        )}
        {/* 显示配置示例 (条件渲染：确保 url 有效) */}
        {url.trim() && url && (
          <div className="w-full text-gray-900 mt-14">
            <h3 className="text-lg md:text-xl font-bold mt-8">
              {target === "surge" ? "Surge 配置示例" : "Clash 配置示例"}
            </h3>
            <p className="mt-2">
              {target === "surge"
                ? "将下面的配置复制到 Surge 的配置文件中，替换掉原有的 Proxy Group 部分。"
                : "将下面的配置复制到 Clash 的配置文件中，替换掉原有的 Proxy Group 部分。"}
            </p>
            <p className="mt-2">
              {target === "surge"
                ? "如果你在使用 Surge 的话，建议使用 Surge 的配置文件格式。"
                : "如果你在使用 Clash 的话，建议使用 Clash 的配置文件格式。"}
            </p>
          </div>
        )}

        {/* 显示配置示例 (条件渲染：确保 url 和 convertedUrl 都有效) */}
        {url.trim() && convertedUrl && (
          <div className="w-full p-4 mt-4 text-gray-100 bg-gray-900 rounded-lg hidden md:block">
            {target == "clash" && clashConfig && (
              <pre className="whitespace-pre-wrap">{clashConfig}</pre>
            )}
            {target === "surge" && surgeConfig && (
              <pre className="whitespace-pre-wrap">{surgeConfig}</pre>
            )}
            <CopyToClipboard
              text={target === "surge" ? surgeConfig : target === "clash" ? clashConfig : ""}
              onCopy={() => copiedToast()}
            >
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>

            </CopyToClipboard>
            {target === "clash" && (
              <><CopyToClipboard
                text={target === "surge" ? surgeConfig : clashConfigProxyProvider}
                onCopy={() => copiedToast()}
              >
                <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                  <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                  点击复制 Clash Proxy Group 的内容
                </div>

              </CopyToClipboard><CopyToClipboard
                text={target === "surge" ? surgeConfig : clashConfigProxyProvider}
                onCopy={() => copiedToast()}
              >
                  <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                    <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                    点击复制 Clash Proxy Provider 的内容
                  </div>

                </CopyToClipboard></>
            )}

          </div>
        )}

        {/* 显示 Surge 面板配置示例 (条件渲染：确保 url 和 surgeSubInfoPanel 都有效，且 target 为 surge) */}
        {url.trim() && url && target === "surge" && (
          <div className="w-full text-gray-900 mt-14">
            <h3 className="text-lg md:text-xl font-bold mt-8">
              {"Surge 面板配置示例"}
            </h3>
            <p className="mt-2">
              {"将下面的配置复制到 Surge 的配置文件中，替换掉原有的 Panel 及 Script 部分。"}
            </p>
            <p className="mt-2">
              {"如果你在使用 Surge 的话，建议使用 Surge 的配置文件格式。"}
            </p>
          </div>
        )}

        {/* 显示 Surge SubInfo Panel (条件渲染：确保 url 和 surgeSubInfoPanel 都有效，且 target 为 surge) */}
        {url.trim() && surgeSubInfoPanel && target === "surge" && (
          <div className="break-all p-3 mt-4 rounded-lg text-gray-100 bg-gray-900 shadow-sm w-full">
            <span className="text-sm text-gray-400">Surge SubInfo Panel：</span>
            <pre className="whitespace-pre-wrap">{surgeSubInfoPanel}</pre>
            <CopyToClipboard text={surgeSubInfoPanel} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制
              </div>
            </CopyToClipboard>
            <CopyToClipboard text={surgeSubInfoPanelPanel} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制 Panel 的内容
              </div>
            </CopyToClipboard>
            <CopyToClipboard text={surgeSubInfoPanelScript} onCopy={() => copiedToast()}>
              <div className="flex items-center text-sm mt-4 text-gray-400 cursor-pointer hover:text-gray-300 transition duration-200 select-none">
                <DuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                点击复制 Script 的内容
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

