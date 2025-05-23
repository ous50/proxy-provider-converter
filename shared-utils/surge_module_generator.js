// surge_function.js (示意喵~)

/**
 * 构建脚本参数字符串
 * @param {object} args - 参数对象, e.g., { url: "http://...", title: "My Sub", icon: "heart.fill=#ff00ff" }
 * @returns {string} - e.g., "url=http%3A%2F%2F...&title=My%20Sub&icon=heart.fill%3D%23ff00ff"
 */
export function buildScriptArgument(args) {
    // 确保对所有 key 和 value 都进行编码，特别是 icon 这种可能包含特殊字符的
    return Object.entries(args)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`) // 处理 value 可能为 undefined 或 null 的情况
        .join('&');
}

/**
 * 生成 Surge 模块的头部注释
 * @param {object} params
 * @param {string} params.title 模块名称
 * @param {string} params.description 模块描述
 * @param {string} [params.category="Subscription Info"] 分类
 * @param {string} [params.author="ous50"] 作者
 * @param {string} [params.icon] 图标URL或SF Symbol (e.g., "externaldrive.fill.badge.icloud=#007aff")
 * @param {number} [params.scriptUpdateInterval=43200] 脚本更新间隔（秒）
 * @returns {string}
 */
export function generateSgmoduleHeader({
    title,
    description,
    category = "Subscription Info",
    author = "ous50",
    icon,
    scriptUpdateInterval = 43200
}) {
    let headerLines = [
        `#!name=${title}`,
        `#!desc=${description}`,
        `#!category=${category}`,
        `#!author=${author}`
    ];
    if (icon) {
        headerLines.push(`#!icon=${icon}`);
    }
    headerLines.push(`#!script-update-interval=${scriptUpdateInterval}`);
    return headerLines.join('\n') + '\n'; // 末尾加一个换行符
}

/**
 * 生成 Surge Panel 配置行
 * @param {object} params
 * @param {string} params.panelId 面板ID (如 "MyPanel-Panel")
 * @param {string} params.scriptName 对应的脚本名称 (如 "MyPanel-Script")
 * @param {string} params.title 面板标题
 * @param {number} [params.updateInterval=43200] 更新间隔（秒）
 * @returns {string}
 */
export function generateSurgePanelLine({ panelId, scriptName, title, updateInterval = 43200 }) {
    return `${panelId} = script-name=${scriptName}, title="${title}", update-interval=${updateInterval}`;
}

/**
 * 生成 Surge Script 配置行
 * @param {object} params
 * @param {string} params.scriptName 脚本名称 (如 "MyPanel-Script")
 * @param {number} [params.timeout=10] 超时时间（秒）
 * @param {string} params.scriptPath 脚本路径
 * @param {number} [params.scriptUpdateInterval=0] 脚本自身更新间隔（0为不自动更新）
 * @param {string} params.argumentString 脚本参数字符串 (已编码)
 * @returns {string}
 */
export function generateSurgeScriptLine({
    scriptName,
    timeout = 10,
    scriptPath = "https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/modules/Panel/Sub-info/Moore/Sub-info.js",
    scriptUpdateInterval = 0,
    argumentString
}) {
    return `${scriptName} = type="generic",timeout=${timeout},script-path=${scriptPath},script-update-interval=${scriptUpdateInterval},argument=${argumentString}`;
}

/**
 * 生成完整的 .sgmodule 内容
 * @param {object} data
 * @param {string} data.baseName - 用于生成 Panel ID 和 Script Name 的基础名称 (通常是 subName)
 * @param {string} data.moduleTitle - #!name 中使用的标题 (通常是 subName 或更友好的名称)
 * @param {string} data.panelTitle - Panel 中显示的标题 (通常包含 subName)
 * @param {string} data.scriptPath - Panel 脚本的远程路径
 * @param {object} data.scriptArgs - Panel 脚本的参数对象 {url, title, icon, ...}
 * @param {string} [data.moduleIcon="externaldrive.fill.badge.icloud=#007aff"] - #!icon
 * @param {number} [data.panelUpdateInterval=43200] - Panel 更新间隔
 * @param {number} [data.scriptTimeout=10] - 脚本超时
 * @returns {string}
 */
export function generateFullSgmodule({
    baseName,
    moduleTitle = baseName,
    panelTitle = baseName,
    scriptPath,
    scriptArgs,
    moduleIcon = "externaldrive.fill.badge.icloud=#007aff",
    panelUpdateInterval = 43200,
    scriptTimeout = 10,
    // 可以加入更多参数如 author, category, moduleDescriptionBase 等
}) {
    // if (!moduleTitle) moduleTitle = baseName; // 如果没有提供 moduleTitle，则使用 baseName
    const moduleDescription = `显示 ${moduleTitle} 的剩余流量信息以及套餐到期日期`; // 或者让这个也变成参数

    // console.log(`Generating SGModule for ${baseName} with script path: ${scriptPath}`);
    // console.log("start generating header");
    const header = generateSgmoduleHeader({
        title: `${moduleTitle} 的订阅信息`, // 对应 #!name
        description: moduleDescription,
        icon: moduleIcon,
        // author, category, scriptUpdateInterval (for module itself) can be added here
    });

    // console.log("header generated");
    // console.log("start generating panel");
    const panelId = `${baseName}-Panel`;
    console.log(`panelId: ${panelId}`);
    const scriptName = `${baseName}-Script`;
    console.log(`scriptName: ${scriptName}`);

    const panelSection = `[Panel]\n${generateSurgePanelLine({
        panelId,
        scriptName,
        title: `${panelTitle} 订阅信息`, // 对应 Panel 的 title
        updateInterval: panelUpdateInterval,
    })}`;

    // console.log("panel generated");
    // console.log("start generating script");
    const argumentString = buildScriptArgument(scriptArgs);
    const scriptSection = `[Script]\n${generateSurgeScriptLine({
        scriptName,
        scriptPath,
        argumentString,
        timeout: scriptTimeout,
        scriptUpdateInterval: 0, // 脚本自身通常不在这里设置更新间隔
    })}`;

    // console.log("script generated");
    // console.log("start generating full sgmodule");

    let fullModule = `${header}\n${panelSection}\n\n${scriptSection}\n`;

    return fullModule;
}

/**
 * 封装了发送 .sgmodule 响应的通用逻辑
 * @param {object} req - Express/Next.js 的请求对象
 * @param {object} res - Express/Next.js 的响应对象
 */
export function sendSGModuleResponse(req, res) {
    let urlHostname;
    const url = req.query.url;
    try {
        urlHostname = new URL(url).hostname; // 直接获取完整的主机名
    } catch (error) {
        console.error("喵呜~客人给的URL有点问题，解析不了呢:", url, error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(400).json({ error: "'url' 好像有问题，请检查一下哦！" });
        return;
    }
    console.log(`urlHostname: ${urlHostname}`);
    const subName = req.query.subName;
    const title = subName ? subName : urlHostname;
    console.log(`title: ${title}`);
    const sgmoduleParams = {
        baseName: title, // 影响 #!name, #!desc, Panel/Script ID, Panel title
        scriptPath: "https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/modules/Panel/Sub-info/Moore/Sub-info.js",
        scriptArgs: {
            url: url,
            title: title, // 脚本内部显示的标题
            icon: "externaldrive.fill.badge.icloud=#007aff",
            // lang: req.query.lang || "zh-CN",
        },
    };
    const sgmoduleString = generateFullSgmodule(sgmoduleParams);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(sgmoduleString);
}


