import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'

const bridge = readFileSync(new URL('../../public/floatem-webview/bridge.js', import.meta.url), 'utf8')
const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const sample = { id: 'todo-sample-old', text: 'Try creating a todo', done: false, groupId: null, reminderAt: null, createdAt: 1, dateKey: '2020-01-01' }

function openDemo({ todos, language = 'en', mode = '' } = {}) {
  const storage = new Map(todos === undefined ? [] : [['floatem.todos', JSON.stringify(todos)]])
  const window = {
    location: { href: `https://example.com/floatem-webview/index.html?language=${language}${mode ? `&mode=${mode}` : ''}` },
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    addEventListener() {},
    parent: { postMessage() {} },
  }
  const document = { querySelector: () => null, createElement: () => ({}), head: { appendChild() {} }, cookie: '' }
  vm.runInNewContext(bridge, { window, document, URL, navigator: {} })
  return { load: async () => JSON.parse(JSON.stringify(await window.floatemHost.loadAllData())), storage }
}

test('empty Todo storage creates one sample in the sandbox language, without duplicates', async () => {
  for (const [language, text] of [['en', 'Try creating a todo'], ['zh', '试试创建一个待办事项']]) {
    const demo = openDemo({ language, todos: { items: [], groups: [{ id: 'existing' }] } })
    const first = await demo.load()
    assert.equal(first.todos.items.length, 1)
    assert.equal(first.todos.items[0].text, text)
    assert.equal(first.todos.items[0].dateKey, todayKey)
    assert.deepEqual(first.todos.groups, [{ id: 'existing' }])
    assert.deepEqual((await demo.load()).todos, first.todos)
  }
})

test('return visits refresh only untouched samples to today and the current language', async () => {
  const input = { items: [sample], groups: [{ id: 'existing' }] }
  const result = (await openDemo({ todos: input, language: 'zh' }).load()).todos
  assert.deepEqual(result, { ...input, items: [{ ...sample, text: '试试创建一个待办事项', dateKey: todayKey }] })
  const legacy = (await openDemo({ todos: [sample] }).load()).todos
  assert.deepEqual(legacy, [{ ...sample, dateKey: todayKey }])
})

test('existing user todos, edited samples, completed samples, groups and reminders stay intact', async () => {
  for (const item of [{ ...sample, id: 'user-todo' }, { ...sample, text: 'My task' }, { ...sample, done: true }, { ...sample, groupId: 'work' }, { ...sample, reminderAt: 123 }]) {
    const input = { items: [item], groups: [{ id: 'work' }] }
    assert.deepEqual((await openDemo({ todos: input, language: 'zh' }).load()).todos, input)
  }
})

test('floating and drag preview windows never seed or refresh samples', async () => {
  for (const mode of ['floating', 'drag-preview']) {
    assert.deepEqual((await openDemo({ todos: [], mode }).load()).todos, [])
    assert.deepEqual((await openDemo({ todos: [sample], mode }).load()).todos, [sample])
  }
})
