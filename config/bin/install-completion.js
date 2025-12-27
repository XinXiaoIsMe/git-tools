#!/usr/bin/env node
import fs from "fs";
import path from "path";
import os from "os";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const home = os.homedir();
const shell = process.env.SHELL || "";

// 自动补全内容
const completionScript = `
# ===== gcp/gcpick 自动补全 =====
_gcp_gcpick_completion() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  opts="$(gcp --help | grep -oE '^[a-zA-Z0-9_-]+')"
  COMPREPLY=( $(compgen -W "\${opts}" -- $cur) )
  return 0
}

_gcp_completion() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  opts="$(gcp --help | grep -oE '^[a-zA-Z0-9_-]+')"
  COMPREPLY=( $(compgen -W "\${opts}" -- $cur) )
  return 0
}

complete -F _gcp_gcpick_completion gcpick
complete -F _gcp_completion gcp
`;

let rcFile;
if (shell.includes("bash")) rcFile = path.join(home, ".bashrc");
else if (shell.includes("zsh")) rcFile = path.join(home, ".zshrc");
else {
  console.error("⚠️ 未识别 shell，请手动添加补全脚本");
  process.exit(1);
}

// 检查是否已存在
const existing = fs.existsSync(rcFile) ? fs.readFileSync(rcFile, "utf-8") : "";
if (!existing.includes("_gcp_gcpick_completion")) {
  fs.appendFileSync(rcFile, "\n" + completionScript + "\n");
  console.log(`✅ 已将 gcp/gcpick 自动补全添加到 ${rcFile}`);
  console.log("请重启终端或执行: source", rcFile);
} else {
  console.log(`ℹ️ 自动补全已存在于 ${rcFile}`);
}
