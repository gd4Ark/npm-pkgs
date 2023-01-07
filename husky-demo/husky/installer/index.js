const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const hookList = [
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-commit',
  'pre-merge-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'pre-rebase',
  'post-checkout',
  'post-merge',
  'pre-push',
  'post-update',
  'push-to-checkout',
  'pre-auto-gc',
  'post-rewrite',
  'sendemail-validate'
]

function git(args, cwd = process.cwd()) {
  return cp.spawnSync('git', args, { stdio: 'pipe', encoding: 'utf-8', cwd })
}

function getGitRoot() {
  return git(['rev-parse', '--show-toplevel']).stdout.trim()
}

function getGitHooksDir() {
  const root = getGitRoot()

  return path.join(root, '.git/hooks')
}

function getHookScript() {
  return `#!/bin/sh

. "$(dirname "$0")/husky.sh"
`
}

function writeHook(filename, script) {
  fs.writeFileSync(filename, script, 'utf-8')
  fs.chmodSync(filename, 0o0755)
}

function createHook(filename) {
  const hookScript = getHookScript()

  writeHook(filename, hookScript)
}

function createHooks(gitHooksDir) {
  getHooks(gitHooksDir).forEach(createHook)
}

function getHooks(gitHooksDir) {
  return hookList.map((hookName) => path.join(gitHooksDir, hookName))
}

function getMainScript() {
  const mainScript = fs.readFileSync(
    path.join(__dirname, '../sh/husky.sh'),
    'utf-8'
  )

  return mainScript
}

function createMainScript(gitHooksDir) {
  fs.writeFileSync(path.join(gitHooksDir, 'husky.sh'), getMainScript(), 'utf-8')
}

module.exports = function install() {
  const gitHooksDir = getGitHooksDir()

  createHooks(gitHooksDir)
  createMainScript(gitHooksDir)
}
