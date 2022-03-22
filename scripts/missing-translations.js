/**
 * Script to finding missing translations in the translation files.
 * Run with: `npm run missing-translations -- --src=en --dst=zh`
 */

function parseArgs() {
  const args = process.argv.slice(2)
  const parsedArgs = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith("--")) {
      const [key, value] = arg.substr(2).split("=")
      parsedArgs[key] = value
    }
  }
  return parsedArgs
}

async function main() {
  const args = parseArgs()
  const { src, dst } = args
  if (!src || !dst) {
    console.error("src and dst are required")
    process.exit(1)
  }
  let srcJson = {}
  let dstJson = {}
  try {
    srcJson = require(`../public/locales/${src}.json`)
    dstJson = require(`../public/locales/${dst}.json`)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
  const srcKeys = new Set(Object.keys(srcJson))
  const missingKeys = [...srcKeys].filter((key) => !dstJson[key])
  console.log(`${missingKeys.length} missing keys\n`)
  missingKeys.sort().forEach((key, i) => {
    console.log(`${i + 1} ${key}: ${srcJson[key]}`)
  })
}

main()
