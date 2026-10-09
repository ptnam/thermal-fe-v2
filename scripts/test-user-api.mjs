import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'

const mockUrl = 'data:text/javascript,' + encodeURIComponent(`
  export default {
    post: async (options) => options,
    put: async (options) => options,
  }
`)
const source = await readFile(new URL('../src/api/user/index.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(
  source.replace("'@/plugins/axios'", JSON.stringify(mockUrl)),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
)
const { addUserApi, editUserApi } = await import(
  'data:text/javascript,' + encodeURIComponent(outputText)
)

for (const id of [null, undefined, 42]) {
  test(`create sends integer zero instead of id=${id} without mutating the form`, async () => {
    const form = {
      id, username: 'demo', password: 'test-only', firstName: 'Demo',
      lastMiddleName: 'User', email: 'demo@example.test', status: 'Active',
      areaIds: [18], roles: [{ id: 2, name: 'User' }],
    }
    const before = structuredClone(form)
    const request = await addUserApi(form)
    assert.equal(request.url, 'api/Users')
    assert.deepEqual(JSON.parse(JSON.stringify(request.data)), { ...before, id: 0 })
    assert.deepEqual(form, before)
  })
}

test('edit preserves the existing user id and payload', async () => {
  const form = { id: 42, username: 'demo', password: '', areaIds: [18] }
  const request = await editUserApi(42, form)
  assert.equal(request.url, 'api/Users/42')
  assert.deepEqual(request.data, form)
  assert.equal(request.data.id, 42)
})
