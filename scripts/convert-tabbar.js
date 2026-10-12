// 将 tabbar SVG 图标批量转换为 PNG（微信小程序仅支持 png/jpg/jpeg）
const fs = require('fs')
const path = require('path')
const { Resvg } = require('@resvg/resvg-js')

const DIR = path.join(__dirname, '..', 'src', 'assets', 'tabbar')
const SIZE = 81 // 微信 tabBar 图标推荐尺寸

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.svg'))

for (const file of files) {
  const svgPath = path.join(DIR, file)
  const pngPath = svgPath.replace(/\.svg$/, '.png')
  const svg = fs.readFileSync(svgPath, 'utf-8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: SIZE }
  })
  const png = resvg.render().asPng()
  fs.writeFileSync(pngPath, png)
  console.log(`converted: ${file} -> ${path.basename(pngPath)}`)
}

console.log(`done: ${files.length} files`)
