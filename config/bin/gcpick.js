#!/usr/bin/env node
import { gcpick, showVersions } from "../index.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
gcpick - 批量 cherry-pick 工具

用法:
  gcpick <branch|version> [<branch|version> ...] -- <commit1> <commit2> ...
  gcpick -- <commit1> <commit2> ...

其他命令:
  gcpick --show-versions, -sv  # 显示已定义版本映射
`);
  process.exit(0);
}

if (args.includes("--show-versions") || args.includes("-sv")) {
  showVersions();
  process.exit(0);
}

// 参数解析
const sepIndex = args.indexOf("--");
let targets = [];
let commits = [];
if (sepIndex >= 0) {
  targets = args.slice(0, sepIndex);
  commits = args.slice(sepIndex + 1);
} else {
  commits = args;
}

gcpick(targets, commits);
