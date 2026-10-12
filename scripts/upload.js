/**
 * 上传小程序新版本到微信平台（生成体验版）
 * 用法：node scripts/upload.js [版本号] [版本描述]
 * 示例：node scripts/upload.js 1.1.0 "优化首页加载与防重复提交"
 * 不传版本号时自动递增 package.json 中的 version 并回写
 */
const path = require('path')
const fs = require('fs')
const ci = require('miniprogram-ci')

const ROOT = path.resolve(__dirname, '..')

// 从 .env.local 读取敏感配置（appid、云环境 ID）
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
const env = loadEnv()
const APP_ID = env.TARO_APP_ID
const KEY_FILE = path.join(ROOT, `.auth/private.${APP_ID}.key`)

const pkgPath = path.join(ROOT, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

let version = process.argv[2]
const desc = process.argv[3] || ''

if (!version) {
  // 自动递增 patch 版本号
  const parts = (pkg.version || '1.0.0').split('.').map(Number)
  parts[2] = (parts[2] || 0) + 1
  version = parts.join('.')
  fs.writeFileSync(pkgPath, JSON.stringify({ ...pkg, version }, null, 2) + '\n')
  console.log(`版本号自动递增为 ${version}（已回写 package.json）`)
}

const project = new ci.Project({
  appid: APP_ID,
  type: 'miniProgram',
  projectPath: ROOT,
  privateKeyPath: KEY_FILE,
  ignores: ['node_modules/**/*']
})

;(async () => {
  const result = await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: false,
      minify: true,
      minifyWXSS: true,
      minifyWXML: true,
      autoPrefixWXSS: true
    },
    onProgressUpdate: (task) => {
      if (task._status === 'done') console.log(`✔ ${task._msg}`)
    }
  })
  console.log(
    `\n✅ 上传成功 版本 ${version}\n   包大小: ${(result.subPackageInfo?.[0]?.size / 1024).toFixed(1) || '—'} KB\n`
  )
  console.log('已可在微信公众平台后台（mp.weixin.qq.com）设为体验版/提交审核')
})().catch((err) => {
  console.error('❌ 上传失败:', err.message || err)
  process.exit(1)
})
