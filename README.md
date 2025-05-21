# Proxy Provider Converter

一个可以将 Clash 订阅转换成 Proxy Provider 和 External Group(Surge) 的工具

DEMO: [https://ppc.ous50.moe](https://ppc.ous50.moe)

### 什么是 Proxy Provider 和 External Group？

[Proxy Provider](https://github.com/Dreamacro/clash/wiki/configuration#proxy-providers) 是 Clash 的一项功能，可以让用户从指定路径动态加载代理服务器列表。使用这个功能你可以将 Clash 订阅里面的代理服务器提取出来，放到你喜欢的配置文件里，也可以将多个 Clash 订阅里的代理服务器混合到一个配置文件里。External Group 则是 Proxy Provider 在 Surge 里的叫法，作用是一样的。

### 怎么自己部署转换工具？

你可以根据下面步骤你可以零成本部署一个属于你的转换工具。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fous50%2Fproxy-provider-converter)

1. 点击上方的按钮
2. 打开 [Vercel.com](https://vercel.com)，使用 GitHub 登录。
3. 等待部署完成后点击 Vercel 项目面板上的 Visit 按钮就可以访问你部署的版本了

### 资源

- [Metacubex(clash) Wiki 中的 Proxy Providers 章节](https://wiki.metacubex.one/config/proxy-providers/)
- [Surge Policy Group 文档](https://manual.nssurge.com/policy-group/policy-including.html)

## TODO 

- [ ] 用 Surge 面板显示订阅信息
- [ ] 支持 Loon