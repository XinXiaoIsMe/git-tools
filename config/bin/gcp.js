#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { config } from "../index.js";

const args = process.argv.slice(2);
const command = args[0];

// =================== init-config ===================
if (command === "init-config") {
  const projectConfigPath = path.resolve(process.cwd(), ".my-git-tools.json");
  if (fs.existsSync(projectConfigPath)) {
    console.log("⚠️ 配置文件已存在:", projectConfigPath);
    process.exit(0);
  }

  const template = {
    versionBranchMap: config.versionBranchMap,
    aliases: config.aliases
  };

  fs.writeFileSync(projectConfigPath, JSON.stringify(template, null, 2), "utf-8");
  console.log("✅ 已生成配置文件:", projectConfigPath);
  console.log("请根据项目需要修改 versionBranchMap 和 aliases");
  process.exit(0);
}

// =================== alias 执行 ===================
if (!command) {
  console.log("使用: gcp <alias> 或 gcp init-config");
  console.log("已定义 alias: ", Object.keys(config.aliases).join(", "));
  process.exit(0);
}

const aliasCommand = config.aliases[command];
if (aliasCommand) {
  try {
    execSync(aliasCommand, { stdio: "inherit" });
  } catch (err) {
    console.error(`❌ 执行 alias ${command} 失败: ${err.message}`);
    process.exit(1);
  }
} else {
  console.error(`⚠️ alias ${command} 未定义`);
  process.exit(1);
}
