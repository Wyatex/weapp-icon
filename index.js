const json = require('./iconify.json')
const https = require('https')
const fs = require('fs')
let path = './assets/iconify.js' // 文件写入路径
process.argv.forEach((argv) => {
  if (argv.split('=')[0] === 'path') {
    path = argv.split('=')[1]
  }
})

// 代码模板
const tepmlate = `// 该文件由脚本自动生成，请勿手动修改
export default {code
}`

// 代码生成逻辑
async function genCode() {
  if (!json.iconList || !json.iconList.length) {
    console.log('请正确设置iconList')
    return
  }
  const iconSvgMap = {}
  for (let index = 0; index < json.iconList.length; index++) {
    const iconName = json.iconList[index]
    const res = await new Promise((resolve) => {
      https.get(`https://api.iconify.design/${iconName}.svg`, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
      })
    })
    iconSvgMap[iconName] = res
  }
  let code = ''
  for (const [name, svg] of Object.entries(iconSvgMap)) {
    code += `\n'${name}': '${svg}',`
  }
  code = tepmlate.replace('code', code)
  fs.writeFileSync(path, code, {
    encoding: 'utf8',
  })
  console.log('代码已生成在：' + path)
}

genCode()
