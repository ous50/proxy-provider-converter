# Enable auto sync with upstream
> [!NOTE]
> - You need to generate a GitHub Token and set it in the project settings under Secrets with the name `PAT_FOR_SYNC`, otherwise automatic updates will not work.
> - If you encounter errors while executing Upstream Sync, try running it manually again.

## Upstream Sync Automatic Updates
When you fork the project, due to GitHub's restrictions, you need to manually enable Workflows on the Actions page of your forked project and start the Upstream Sync Action. After enabling it, you can set it to update automatically every hour (default is every 6 hours).

If you encounter synchronization failures, you need to manually click "Update Branch" again.