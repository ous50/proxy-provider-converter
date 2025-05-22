# 更新日志 (UPDATE.md)

---

## [2025-05-22] - 新增 Surge 订阅信息面板支持及其他优化

本次更新主要为 Surge 用户带来了订阅信息面板功能，并进行了一些后端和前端的优化。

### ✨ 新增功能

1.  **Surge 订阅信息面板 (`.sgmodule` 及配置片段)**
    *   **API 支持**: `pages/api/subinfo.js` 接口新增 `format=.sgmodule` 查询参数。当提供此参数时，API 将返回一个预配置的 Surge 模块（`.sgmodule`）内容。
    *   **`.sgmodule` 文件**: 用户现在可以直接获取一个 `.sgmodule` 文件链接，导入 Surge 后即可显示订阅的流量使用情况（已用、剩余、总量）和到期时间。
    *   **配置代码片段**: 对于需要手动配置的用户，界面上也会提供相应的 Surge `[Panel]` 和 `[Script]` 配置代码片段，方便集成到现有 Surge 配置文件中。

### 🛠️ 优化与修复

*   **API 优化**: 移除了 `pages/api/subinfo.js` 中未使用的 `YAML` 和 `crypto` 依赖，提升了接口的轻量化和效率。
*   **前端显示**: 修正了 Clash 配置示例中 `proxy-groups` 和 `proxy-providers` 部分的缩进问题，使其更符合规范。
*  

> [!NOTE]
> - Clash 配置示例中 `proxy-groups` 和 `proxy-providers` 的拷贝内容不会包含 `[proxy-groups:]` 和 `[proxy-providers:]`，用户在使用时需要手动添加。
> - Surge 配置示例中 `[Panel]` 和 `[Script]` 的拷贝内容不会包含 `[Panel]` 和 `[Script]`，用户在使用时需要手动添加.
> 

---
