// Thống kê chuỗi tiếng Việt còn hardcode trong src (bỏ qua comment và thư mục locales)
// và kiểm tra key t('...') dạng chuỗi cố định có tồn tại trong locales/vi.
// Chạy: npm run i18n:report  (thêm --all để in toàn bộ file). Exit 1 nếu có key thiếu.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..', 'src')
const SKIP_DIRS = new Set(['locales', 'assets'])
const EXTS = ['.vue', '.ts', '.tsx', '.js']
const VIETNAMESE = /[ăâđêôơưàáạảãấầẩẫậắằẳẵặèéẹẻẽếềểễệìíịỉĩòóọỏõốồổỗộớờởỡợùúụủũứừửữựỳýỵỷỹ]/i
const T_CALL = /\bt\(\s*['"]([\w-]+(?:\.[\w-]+)+)['"]/g

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return SKIP_DIRS.has(name) ? [] : walk(path)
    return EXTS.some((ext) => name.endsWith(ext)) ? [path] : []
  })

const stripComments = (code) =>
  code
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ''))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ''))
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')

// File message chỉ là object literal nên đánh giá trực tiếp được
const loadMessages = (lang) => {
  const dir = join(ROOT, 'locales', lang)
  return Object.fromEntries(
    readdirSync(dir)
      .filter((name) => name.endsWith('.ts'))
      .map((name) => {
        const code = readFileSync(join(dir, name), 'utf8').replace('export default', 'return')
        return [name.slice(0, -3), new Function(code)()]
      }),
  )
}
const hasKey = (messages, key) =>
  key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), messages) !==
  undefined

const vi = loadMessages('vi')
const rows = []
const missing = []
for (const file of walk(ROOT)) {
  const code = stripComments(readFileSync(file, 'utf8').normalize('NFC'))
  const rel = relative(ROOT, file).replaceAll('\\', '/')
  const count = code.split('\n').filter((l) => VIETNAMESE.test(l)).length
  if (count) rows.push({ file: rel, count })
  for (const [, key] of code.matchAll(T_CALL)) {
    if (!hasKey(vi, key)) missing.push(`${rel}: ${key}`)
  }
}
rows.sort((a, b) => b.count - a.count)

const total = rows.reduce((sum, r) => sum + r.count, 0)
const shown = process.argv.includes('--all') ? rows : rows.slice(0, 30)
for (const r of shown) console.log(String(r.count).padStart(5), r.file)
console.log(`\n${total} dòng tiếng Việt hardcode trong ${rows.length} file`)

if (missing.length) {
  console.log(`\n${missing.length} key không có trong locales/vi:`)
  for (const m of [...new Set(missing)]) console.log('  ' + m)
  process.exitCode = 1
}
