# My Git Tools

提供 gcpick 批量 cherry-pick + gcp alias + 自动补全功能

## 安装

```bash
npm install -g my-git-tools
```

# 项目配置

## 初始化项目配置

生成项目自定义配置文件 `.my-git-tools.json`：

```bash
gcp init-config
```

生成后可以自定义：
- versionBranchMap：自定义版本与分支映射
- aliases：自定义 git 命令别名

示例 `.my-git-tools.json`：
```json
{
  "versionBranchMap": {
    "V3.2.2.1": ["V3.2.2.1B", "V3.2.2.1-sss", "V3.2.2.1-sinap", "V3.2.2.1-xemc", "V3.2.2.1-CNP"],
    "V3.2.3.0": ["V3.2.3.0B", "V3.2.3.0-JINLUN", "V3.2.3.0-xp", "V3.2.3.0-CSYZ", "V3.2.3.0-demo"]
  },
  "aliases": {
    "gs": "git status",
    "gp": "git push",
    "gl": "git pull",
    "gst": "git pull && rm -rf node_modules && npm install"
  }
}

```
## 使用

### gcpick - 批量 cherry-pick
```bash
# 将多个 commit 应用到指定分支或版本
gcpick <branch|version> [<branch|version> ...] -- <commit1> <commit2> ...

# 示例
gcpick V3.2.3.0 feature/login -- a1b2c3 d4e5f6

# 当前分支直接 cherry-pick
gcpick -- a1b2c3 d4e5f6

```

### 查看版本映射
```bash
gcpick --show-versions
gcpick -sv
```

### 帮助
```bash
gcpick --help
gcpick -h
```

### gcp - git alias 快捷命令
```bash
# 执行 alias
gcp gs  # git status
gcp gp  # git push
gcp gl  # git pull

# 初始化项目配置
gcp init-config
```

已定义 alias:
```bash
gs, gp, gl
```

### 自动补全
```bash
gcp-completion
# 然后重启终端或者 source ~/.bashrc / ~/.zshrc
```
Tab 键即可补全 gcp 和 gcpick 命令。

## 特性
1. 支持多分支 cherry-pick，包括版本分支和普通分支
2. 自动跳过已存在 commit 或 empty commit，并在完成后汇总
3. 支持自定义 alias 和 version 分支映射
4. ES Module 结构，现代化 Node.js 工具库
5. 支持项目级配置和全局用户配置
6. 一条命令安装命令行自动补全

## 注意事项
- commit id 必须在 -- 后面指定
- 版本分支必须在 versionBranchMap 中定义，否则当成普通分支处理
- 已存在或 empty commit 会自动跳过
- 冲突时需手动解决 `git cherry-pick --continue` 或 `git cherry-pick --abort`