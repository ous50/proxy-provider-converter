# 启动自动更新
> [!NOTE]
> - 用户需要生成一个具有 `Actions`、`Commit statuses`、`Contents`、`Pull requests` 和 `Workflows` 权限的个人访问令牌（PAT），并在项目设置中的 Secrets 中设置名称为 `PAT_FOR_SYNC`，否则自动更新将无法工作。
> - 如果你在执行 Upstream Sync 时遇到错误，请尝试手动执再行一次

## Upstream Sync 自动更新
当你 Fork 了项目后，由于 Github 的限制，你需要手动在你 Fork 的项目的 Actions 页面启用 Workflows，并启动 Upstream Sync Action。启用后，你可以设置每小时进行一次自动更新（默认每6小时更新一次）。

如果你遇到了同步失败的情况，你需要手动重新点一次 「Update Branch」。

