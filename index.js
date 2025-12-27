import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// 默认配置
const defaultConfigPath = path.resolve(__dirname, "./config/default.json");
const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, "utf-8"));

// 用户自定义配置路径
let userConfigPath = path.resolve(process.cwd(), ".my-git-tools.json");
if (!fs.existsSync(userConfigPath)) {
  userConfigPath = path.resolve(os.homedir(), ".my-git-tools.json");
}

let userConfig = {};
if (fs.existsSync(userConfigPath)) {
  try {
    userConfig = JSON.parse(fs.readFileSync(userConfigPath, "utf-8"));
  } catch (err) {
    console.warn(`⚠️ 用户自定义配置解析失败: ${err.message}`);
  }
}

// 合并配置，仅覆盖用户自定义字段
export const config = {
  versionBranchMap: { ...defaultConfig.versionBranchMap, ...(userConfig.versionBranchMap || {}) },
  aliases: { ...defaultConfig.aliases, ...(userConfig.aliases || {}) }
};

// ======================== gcpick ========================
export function gcpick(targets = [], commits = []) {
  const VERSION_BRANCH_MAP = config.versionBranchMap;
  if (!commits.length) throw new Error("必须至少指定一个 commit id");

  let branches = [];
  for (const t of targets) {
    if (VERSION_BRANCH_MAP[t]) branches.push(...VERSION_BRANCH_MAP[t]);
    else branches.push(t);
  }
  branches = [...new Set(branches)];

  const currentBranch = execSync("git branch --show-current").toString().trim();
  const skippedCommits = {};

  for (const branch of branches) {
    console.log(`\n🚀 处理分支: ${branch}`);
    try {
      const localExists = execSync(`git show-ref --verify --quiet refs/heads/${branch}; echo $?`).toString().trim() === "0";
      if (localExists) execSync(`git checkout ${branch}`, { stdio: "inherit" });
      else {
        const remoteExists = execSync(`git ls-remote --exit-code --heads origin ${branch} &>/dev/null; echo $?`).toString().trim() === "0";
        if (remoteExists) {
          execSync(`git fetch origin ${branch}:${branch}`, { stdio: "inherit" });
          execSync(`git checkout ${branch}`, { stdio: "inherit" });
        } else {
          console.warn(`⚠️ 分支 ${branch} 不存在，跳过`);
          continue;
        }
      }

      execSync("git pull --rebase", { stdio: "inherit" });

      for (const commit of commits) {
        const exists = execSync(`git merge-base --is-ancestor ${commit} HEAD; echo $?`).toString().trim() === "0";
        if (exists) {
          console.log(`⚠️ commit ${commit} 已存在于 ${branch}，跳过`);
          skippedCommits[branch] = (skippedCommits[branch] || []).concat(commit);
          continue;
        }

        try {
          const output = execSync(`git cherry-pick ${commit}`, { stdio: "pipe" }).toString();
          if (output.includes("The previous cherry-pick is now empty")) {
            console.log(`⚠️ commit ${commit} 在 ${branch} 已被 cherry-pick 或 empty，跳过`);
            execSync("git cherry-pick --skip", { stdio: "inherit" });
            skippedCommits[branch] = (skippedCommits[branch] || []).concat(commit);
            continue;
          }
        } catch (err) {
          console.error(`❌ 分支 ${branch} cherry-pick ${commit} 失败`);
          execSync("git cherry-pick --abort", { stdio: "inherit" });
          skippedCommits[branch] = (skippedCommits[branch] || []).concat(commit);
        }
      }

      execSync("git push", { stdio: "inherit" });
    } catch (err) {
      console.error(`❌ 分支 ${branch} 处理失败: ${err.message}`);
    }
  }

  execSync(`git checkout ${currentBranch}`, { stdio: "inherit" });

  console.log("\n=================== 汇总：跳过的 commit ===================");
  if (Object.keys(skippedCommits).length) {
    for (const [branch, commits] of Object.entries(skippedCommits)) {
      console.log(`分支 ${branch} 跳过 commit: ${commits.join(" ")}`);
    }
  } else console.log("无跳过的 commit");
  console.log("==========================================================");
  console.log("\n✅ gcpick 完成");
}

// ======================== showVersions ========================
export function showVersions() {
  console.log("=================== 已定义版本映射 ===================");
  Object.entries(config.versionBranchMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => console.log(`${k} : ${v.join(" ")}`));
  console.log("=====================================================");
}
