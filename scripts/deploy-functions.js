/**
 * 通过微信开发者工具 CLI 部署所有云函数
 * 用法：node scripts/deploy-functions.js [函数名...]
 *
 * 注意：云函数首次部署时会被「创建」，此时立即上传代码会报
 * FailedOperation.UpdateFunctionCode（函数处于 Creating 状态），
 * 因此脚本对失败项做最多 3 次重试。
 *
 * 前置条件：微信开发者工具 → 设置 → 安全设置 → 开启服务端口
 */
const path = require('path')
const fs = require('fs')
const { execFileSync } = require('child_process')

const CLI = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
const ROOT = path.resolve(__dirname, '..')

// 从 .env.local 读取云环境 ID
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ 缺少 .env.local，请参照 .env.example 创建')
    process.exit(1)
  }
  const env = {}
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^(\w+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  })
  return env
}
const ENV = loadEnv().TARO_APP_CLOUD_ENV
const MAX_RETRY = 3
const RETRY_DELAY_MS = 12000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function deploy(name) {
  try {
    execFileSync(
      CLI,
      [
        'cloud', 'functions', 'deploy',
        '--e', ENV,
        '--n', name,
        '--r',
        '--project', ROOT
      ],
      { encoding: 'utf8', stdio: 'pipe' }
    )
    return { ok: true }
  } catch (err) {
    return { ok: false, output: (err.stdout || '') + (err.stderr || '') }
  }
}

;(async () => {
  const names = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs.readdirSync(path.join(ROOT, 'cloudfunctions')).filter((d) =>
        fs.existsSync(path.join(ROOT, 'cloudfunctions', d, 'index.js'))
      )

  const failed = []
  for (const name of names) {
    let result = { ok: false }
    for (let i = 0; i < MAX_RETRY; i++) {
      result = deploy(name)
      if (result.ok) break
      const creating = /Creating状态|Creating state/i.test(result.output || '')
      if (!creating) break
      console.log(`⏳ ${name} 正在创建中，${RETRY_DELAY_MS / 1000}s 后重试 (${i + 1}/${MAX_RETRY})`)
      await sleep(RETRY_DELAY_MS)
    }
    if (result.ok) {
      console.log(`✅ ${name}`)
    } else {
      console.error(`❌ ${name}`)
      console.error((result.output || '').trim().split('\n').slice(-8).join('\n'))
      failed.push(name)
    }
  }

  console.log(`\n完成：${names.length - failed.length}/${names.length} 个云函数部署成功`)
  if (failed.length) {
    console.log('失败：' + failed.join(', '))
    process.exit(1)
  }
})()