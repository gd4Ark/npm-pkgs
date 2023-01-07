#!/usr/bin/env node

const { spawnSync } = require('child_process')
const { cosmiconfigSync } = require('cosmiconfig')

function getConf(dir) {
  const explorer = cosmiconfigSync('husky')
  const { config = {} } = explorer.search(dir) || {}

  const defaults = {
    skipCI: true
  }

  return { ...defaults, ...config }
}

function getCommand(cwd, hookName) {
  const config = getConf(cwd)

  return config && config.hooks && config.hooks[hookName]
}

function runner(
  [, , hookName = '', HUSKY_GIT_PARAMS],
  { cwd = process.cwd() } = {}
) {
  const command = getCommand(cwd, hookName)

  const env = {}

  if (HUSKY_GIT_PARAMS) {
    env.HUSKY_GIT_PARAMS = HUSKY_GIT_PARAMS
  }

  if (command) {
    return runCommand(cwd, hookName, command, env)
  }

  return 0
}

function runCommand(cwd, hookName, cmd, env) {
  const { status } = spawnSync('sh', ['-c', cmd], {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  })

  if (status !== 0) {
    const noVerifyMessage = [
      'commit-msg',
      'pre-commit',
      'pre-rebase',
      'pre-push'
    ].includes(hookName)
      ? '(add --no-verify to bypass)'
      : '(cannot be bypassed with --no-verify due to Git specs)'

    console.log(`husky > ${hookName} hook failed ${noVerifyMessage}`)
  }

  // If shell exits with 127 it means that some command was not found.
  // However, if husky has been deleted from node_modules, it'll be a 127 too.
  // To be able to distinguish between both cases, 127 is changed to 1.
  if (status === 127) {
    return 1
  }

  return status || 0
}

async function run() {
  try {
    const status = await runner(process.argv)
    process.exit(status)
  } catch (err) {
    console.log('Husky > unexpected error', err)
    process.exit(1)
  }
}

run()
