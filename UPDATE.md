# 更新日志 (UPDATE.md)

---

## [2025-05-22] - Surge 订阅信息面板支持及多项优化 (Commit cf06965)

本次更新为 Surge 用户带来了便捷的订阅信息面板功能，同时对 API、前端显示和文档进行了优化，提升了整体用户体验和开发者友好度。

> [!IMPORTANT]
> Surge 用户现在可以直接通过生成的 `.sgmodule` 链接或配置代码片段，在 Surge 中显示订阅的流量使用情况和到期时间，极大提升了便利性。

### ✨ 新增功能 (Features)

1.  **Surge 订阅信息面板 (`.sgmodule` 及配置片段) (UX 提升)**
    *   **API 支持**: `pages/api/subinfo.js` 接口新增 `format=.sgmodule` 查询参数。当提供此参数时，API 将返回一个预配置的 Surge 模块（`.sgmodule`）内容。
    *   **`.sgmodule` 文件**: 用户现在可以直接获取一个 `.sgmodule` 文件链接，导入 Surge 后即可显示订阅的流量使用情况（已用、剩余、总量）和到期时间。
    *   **配置代码片段**: 对于需要手动配置的用户，界面上也会提供相应的 Surge `[Panel]` 和 `[Script]` 配置代码片段，方便集成到现有 Surge 配置文件中。
2.  **新增 `UPDATE.MD` (DX/UX 提升)**
    *   项目现在有了正式的更新日志文件，方便用户追踪版本变化。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **API 优化 (DX/性能优化)**: 移除了 `pages/api/subinfo.js` 中未使用的 `YAML` 和 `crypto` 依赖，提升了接口的轻量化和效率。
*   **前端显示优化 (UX 提升)**:
    *   修正了 Clash 配置示例中 `proxy-groups` 和 `proxy-providers` 部分的缩进问题，使其更符合规范。
    *   更新了 `README.md`，增加了 Surge 面板功能的介绍、Surge Panel 文档链接，并更新了 TODO 列表。
*   **Clash/Surge 配置复制行为明确化 (UX 提升)**:
    > [!NOTE]
    > *   Clash 配置示例中 `proxy-groups` 和 `proxy-providers` 的拷贝内容不会包含 `[proxy-groups:]` 和 `[proxy-providers:]` 顶级键，用户在使用时需要手动添加。
    > *   Surge 配置示例中 `[Panel]` 和 `[Script]` 的拷贝内容不会包含 `[Panel]` 和 `[Script]` 顶级键，用户在使用时需要手动添加。

---

## [2025-05-22] - 提升开发体验及 Clash 配置灵活性 (Commit 904acb1)

本次更新主要关注提升开发效率和 Clash 配置的灵活性。

### ✨ 新增功能 (Features)

*   **Turbopack 开发支持 (DX 提升)**:
    *   `package.json` 中新增 `dev-turbopack` 脚本 (`next dev --turbopack`)，为开发者提供了使用 Turbopack 进行本地开发的选项，有助于加快开发服务器的启动和热更新速度。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **Clash 配置灵活性提升 (UX 提升)**:
    *   前端页面现在将 Clash 配置的 `proxy-groups` 和 `proxy-providers` 部分分开展示。
    *   用户可以单独复制 `proxy-groups` 或 `proxy-providers` 的配置内容，方便将其更灵活地整合到个人现有的复杂 Clash 配置文件中。
*   **前端 UI 调整 (UX 提升)**:
    *   配置示例（包括标题和说明文字）现在只会在用户输入了有效的订阅 URL 后才显示，避免了空状态下的信息干扰。

> [!TIP]
> 开发者现在可以尝试使用 `npm run dev-turbopack` (或 pnpm/yarn 对应命令) 来体验更快的本地开发构建速度。

---

## [2025-05-22] - 新增订阅信息 API 及前端集成 (Commit e5f96fe)

此更新引入了一个新的 API 端点，用于获取和展示订阅的详细信息，并在前端页面进行了相应集成。

### ✨ 新增功能 (Features)

1.  **订阅信息 API (`/api/subinfo`) (核心功能, UX/DX 提升)**:
    *   创建了新的 API 接口 `pages/api/subinfo.js`。
    *   该接口接收 `url` (订阅链接) 和可选的 `subName` (订阅名称) 作为查询参数。
    *   功能：获取指定订阅链接响应头中的 `subscription-userinfo` 信息，解析并格式化流量数据（已用、剩余、总量）和到期时间。
    *   返回处理后的订阅信息文本。
2.  **前端集成订阅信息显示 (UX 提升)**:
    *   主页面 (`pages/index.js`) 新增了生成和显示 `/api/subinfo` 链接的逻辑。
    *   用户可以直接复制此链接，在浏览器中查看格式化后的订阅信息。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **API (`/api/convert`) 调整 (DX/代码质量)**:
    *   在 Clash 目标转换结果的 YAML 内容前，添加了 `# Subscription URL: ${url}` 注释，方便溯源。
    *   对 `/api/convert` 中 `subName` 参数的处理逻辑进行了调整，使其与新的 `subName` 状态管理方式一致。
*   **前端状态管理优化 (DX 提升)**:
    *   调整了前端页面中与订阅名称相关的状态变量命名，使其更清晰（例如，从 `subNameValue` 调整为 `subName`）。

> [!NOTE]
> 新的 `/api/subinfo` 接口为用户提供了一个不经转换器、直接查看原始订阅信息的便捷途径。

---

## [2025-05-22] - 支持 Clash 订阅节点名称后缀及代码清理 (Commit f959714)

本次更新为 Clash 用户增加了节点名称后缀自定义功能，并清理了部分冗余代码。

### ✨ 新增功能 (Features)

*   **Clash 订阅节点名称后缀支持 (UX 提升)**:
    *   `pages/api/convert.js` API 现在支持为 Clash 配置文件中的代理节点名称添加用户定义的后缀。当 `target` 为 `clash` 且提供了 `subName` (在此版本中仍为 `subNameValue`) 参数时，后缀将被应用。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **代码清理 (DX/代码质量)**:
    *   移除了 `pages/api/convert.js` 中大量被注释掉的、与旧版订阅信息处理相关的代码。这些逻辑已通过新的 `/api/subinfo` 接口或前端逻辑实现，使得 `/api/convert` 接口更专注于转换本身。

---

## [2025-05-22] - 更新 README 文档 (Commit d653e69)

对项目 `README.md` 文件进行了更新。

### 📝 文档 (Documentation)

*   **DEMO 链接更新 (UX 提升)**: 将 `README.md` 中的演示链接更新为 `https://ppc.ous50.moe`。
*   **TODO 列表添加 (DX)**: 在 `README.md` 文件末尾新增了 `TODO` 部分，计划了未来的功能开发，包括：
    *   用 Surge 面板显示订阅信息。
    *   支持 Loon。

---

## [2025-05-21] - 新增代理名称后缀及优化前端订阅信息选项逻辑 (Commit 6a216f3)

此更新为 Surge 用户添加了代理名称后缀功能，并对前端用户界面和性能进行了优化。

### ✨ 新增功能 (Features)

*   **Surge 代理名称后缀 (UX 提升)**:
    *   `/api/convert.js` API 现在支持为 Surge 策略列表中的节点名称添加用户自定义的后缀。
    *   前端页面 (`pages/index.js`) 增加了 "启用订阅名称后缀" 的复选框及对应的后缀名输入框，允许用户进行自定义。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **前端选项逻辑优化 (UX 提升)**:
    *   针对 Surge 目标，"在列表中加入订阅信息" 和 "在列表中删除订阅信息" 这两个复选框的交互逻辑得到优化，确保它们是互斥的（勾选一个会自动取消另一个）。
*   **前端性能与代码质量提升 (DX/UX 提升)**:
    *   `pages/index.js` 大量采用 `useMemo` 来缓存计算结果（如转换链接、主机名、Clash/Surge 配置示例等），减少了不必要的重复计算，提升了页面响应速度。
    *   改进了对 URL 和主机名的处理，使其更加健壮。
    *   对部署说明部分的文本和链接进行了微调。

> [!TIP]
> 用户现在可以为 Surge 策略中的节点名称添加自定义后缀，方便在多个订阅源混合使用时进行区分。

---

## [2025-05-20] - API 返回内容增强及 Surge 订阅信息选项 (Commit 872ba3c)

本次更新改进了 API 返回内容，并为 Surge 用户在转换结果中添加了显示订阅信息的选项。

### ✨ 新增功能 (Features)

*   **Surge 订阅信息显示选项 (UX 提升)**:
    *   前端页面 (`pages/index.js`) 为 Surge 转换目标增加了 "在列表中加入订阅信息" 的复选框。
    *   `/api/convert.js` API 会根据此选项，在生成的 Surge 策略列表顶部添加包含流量和到期时间的虚拟节点。
    *   同时，API 也支持根据另一个（隐式）选项（`removeSubInfo`，逻辑上与 `displaySubInfo` 互斥）来移除上游可能已包含的此类信息节点。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **API 返回内容增强 (DX/UX 提升)**:
    *   `/api/convert.js` 在转换后的 Surge 策略列表顶部添加了 `# Subscription URL: ${url}` 注释，方便用户追踪原始订阅链接。

---

## [2025-03-29] - 修复 API 模块导出方式 (Commit 4d4d6ce)

此提交修复了 `/api/convert.js` 文件中的模块导出和导入方式。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **API 模块化修复 (DX/构建修复)**:
    *   `pages/api/convert.js` 的模块导出方式从 CommonJS (`module.exports`) 修改为 ES Module (`export default`)。
    *   相关的依赖导入方式也从 `require` 修改为 `import`。
    *   此更改确保了与 Next.js 或 Vercel 函数所推荐的模块系统更好地兼容。

---

## [2025-03-29] - 构建及分析工具配置调整 (Commit fbeb03f)

本次提交对项目的构建配置和分析工具集成进行了一些调整。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **构建/部署配置调整 (DX/部署)**:
    *   `next.config.js`: 注释掉了 `rewrites` 配置，该配置之前可能用于代理第三方分析脚本。
    *   `package.json`: `dev` 脚本从 `next dev --turbopack` 暂时改回了 `next dev`。
*   **分析工具调整 (DX/运维)**:
    *   `pages/_app.js`: 暂时移除了 Vercel Analytics 和 Speed Insights 的全局集成代码。
    *   `pages/index.js`: 在页面级别重新引入了 Vercel Analytics 和 Speed Insights 组件。

> [!NOTE]
> 这些调整可能是为了优化分析工具的加载方式或解决之前集成中遇到的问题。开发者应注意 `dev` 脚本的临时变化。

---

## [2025-03-29] - 移除依赖锁文件 (Commit 631d365)

此提交从版本控制中移除了项目的依赖锁文件。

### 🔧 其他 (Others)

*   **依赖管理调整 (DX)**:
    *   删除了 `package-lock.json` 和 `pnpm-lock.yaml` 文件。

> [!CAUTION]
> 移除了依赖锁文件（`package-lock.json`, `pnpm-lock.yaml`）。这可能导致在不同环境或不同时间安装依赖时，实际安装的包版本出现不一致，增加了构建不可预测的风险。建议重新引入并维护一个锁文件以保证依赖版本的确定性。

---

## [2025-03-29] - 框架升级及分析工具集成 (Commit bab161d)

对项目依赖进行了重要升级，并集成了 Vercel 的分析工具。

### ✨ 新增功能 (Features)

*   **分析工具集成 (DX/运维)**:
    *   `package.json`: 新增 `@vercel/analytics` 和 `@vercel/speed-insights` 依赖。
    *   `pages/_app.js`: 集成了 Vercel Analytics 和 Speed Insights 组件，用于收集匿名使用数据和性能指标。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **框架与核心依赖升级 (DX/性能/安全)**:
    *   `next` 版本升级至 `^15.2.4`。
    *   `react` 版本升级至 `^18.3.1`。
    *   `react-dom` 版本升级至 `^18.3.1`。
    *   `axios` 版本升级至 `^1.8.4`。
    *   `dev` 脚本尝试使用 `next dev --turbopack` 以提升开发速度。
*   **版本控制配置 (DX)**:
    *   `.gitignore` 文件更新，新增了对多种锁文件 (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`) 和 macOS 系统文件 (`.DS_Store`) 的忽略规则。
*   **代码适配 (DX)**:
    *   调整了在客户端获取 `window.location.origin` 的方式，以更好地适应 Next.js 的渲染机制。

> [!IMPORTANT]
> 项目的核心依赖 (Next.js, React, Axios) 已升级到较新版本，这可能带来性能提升、新特性支持和安全修复。开发者和自行部署的用户应确保环境兼容。

---

## [2025-03-27] - 增强订阅信息显示及日期格式本地化 (Commit 1560eef)

此更新改进了转换后订阅信息的展示方式，并对日期格式进行了本地化处理。

### ✨ 新增功能 (Features)

*   **已用流量显示 (UX 提升)**:
    *   在通过 `subscription-userinfo` 解析订阅信息时，API (`/api/convert.js`) 现在会计算并格式化“已用流量”。
    *   当为 Surge 生成包含订阅信息的虚拟节点时，`Traffic` 信息更新为同时显示已用和剩余流量，格式如：`Traffic：[已用流量]|[剩余流量]`。

### 🛠️ 优化与修复 (Improvements & Fixes)

*   **日期格式本地化 (UX 提升)**:
    *   API (`/api/convert.js`) 中用于格式化到期时间的 `formatTimestamp` 函数，现在会使用 `toLocaleDateString("zh-CN")`，为中国用户显示更友好的日期格式（例如 `YYYY/M/D`）。
*   **代码细节调整 (DX)**:
    *   对 Surge 策略字符串的拼接、TLS 指纹（fingerprint）处理、ALPN 数组转换等细节进行了微调，以提高代码的健壮性和清晰度。

---

## [2025-03-27] - 文档修正 (Commit 10700c1)

对 `README.md` 文件中的一处笔误进行了修正，并引入了 pnpm 锁文件。

### 📝 文档 (Documentation)

*   **README 修正 (UX 提升)**: 修正了 `README.md` 中关于如何部署项目的说明文字中的一处小笔误。

### 🔧 其他 (Others)

*   **项目管理 (DX)**:
    *   新增 `pnpm-lock.yaml` 文件。这表明项目可能已开始或正在尝试使用 pnpm 作为其包管理器。

> [!NOTE]
> 引入 `pnpm-lock.yaml` 有助于保证开发和部署过程中依赖版本的一致性，推荐所有协作者和部署者使用 pnpm进行依赖管理。

---
