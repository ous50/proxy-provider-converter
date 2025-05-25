# 启动自动更新
> [!NOTE]
> - 你需要自己生成 GitHub Token，并将其在项目设置中 Secrets，名称为 `PAT_FOR_SYNC`，否则无法进行自动更新。
> - 如果你在执行 Upstream Sync 时遇到错误，请尝试手动执再行一次

## Upstream Sync 自动更新
当你 Fork 了项目后，由于 Github 的限制，你需要手动在你 Fork 的项目的 Actions 页面启用 Workflows，并启动 Upstream Sync Action。启用后，你可以设置每小时进行一次自动更新（默认每6小时更新一次）。

如果你遇到了同步失败的情况，你需要手动重新点一次 「Update Branch」。

