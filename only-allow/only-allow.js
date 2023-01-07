const PACKAGE_MANAGER_LIST = ['npm', 'yarn', 'pnpm']

const argv = process.argv.slice(2)

if (argv.length === 0) {
  const name = PACKAGE_MANAGER_LIST.join('|')

  console.log(`Please specify the wanted package manager: only-allow <${name}>`)

  process.exit(1)
}

const wantedPM = argv[0]

if (!PACKAGE_MANAGER_LIST.includes(wantedPM)) {
  const name = PACKAGE_MANAGER_LIST.join(',')

  console.log(
    `"${wantedPM}" is not a valid package manager. Available package managers are: ${name}.`
  )

  process.exit(1)
}

const usedPM = getPackageManagerByUserAgent(
  process.env.npm_config_user_agent
).name

if (usedPM !== wantedPM) {
  console.error(`You are using ${usedPM} but wanted ${wantedPM}`)

  process.exit(1)
}

function getPackageManagerByUserAgent(userAgent) {
  if (!userAgent) {
    throw new Error(`'userAgent' arguments required`)
  }

  const spec = userAgent.split(' ')[0]

  const [name, version] = spec.split('/')

  return {
    name,
    version
  }
}
