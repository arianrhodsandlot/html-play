import { deepEqual, equal, notEqual, ok } from 'node:assert'
import { type Server, createServer } from 'node:http'
import { describe, test } from 'node:test'
import serveHandler from 'serve-handler'
import { htmlPlay } from '../src/index.js'

describe.only('html-play', () => {
  const testLinks = {
    unsplash: 'http://localhost:3000/tests/html/unsplash',
    node: 'http://localhost:3000/tests/html/node',
    redirect: 'http://localhost:3000/tests/html/redirect',
    base: 'http://localhost:3000/tests/html/base',
    json: 'http://localhost:3000/tests/html/json.json',
  }

  let server: Server

  test.before(() => {
    server = createServer(serveHandler)
    server.listen(3000)
  })

  test.after(() => {
    server.close()
  })

  test('text and rawText', async () => {
    const { dom } = await htmlPlay(testLinks.node)
    const element = dom.find('#home-intro')
    equal(
      element?.text,
      'Node.js® is an open-source, cross-platform JavaScript runtime environment. Download Node.js® 20.11.0 LTSRecommended For Most UsersOther DownloadsChangelogAPI Docs 21.6.0 CurrentLatest FeaturesOther DownloadsChangelogAPI Docs For information about supported releases, see the release schedule.',
    )
    equal(
      element?.rawText,
      'Node.js® is an open-source, cross-platform JavaScript runtime environment.\n  \n  Download Node.js®\n  20.11.0 LTSRecommended For Most UsersOther DownloadsChangelogAPI Docs\n  21.6.0 CurrentLatest FeaturesOther DownloadsChangelogAPI Docs\n  For information about supported releases, see the release schedule.',
    )
  })

  test('html', async () => {
    const { dom } = await htmlPlay(testLinks.node)
    equal(dom.find('h2')?.html, '<h2>Download Node.js®</h2>')
  })

  test('link', async () => {
    const { dom } = await htmlPlay(testLinks.node)
    const anchor = dom.find('a')
    equal(anchor?.link, 'http://localhost:3000/en')
    equal(anchor?.getAttribute('href'), '/en')
  })

  test('links', async () => {
    const { dom } = await htmlPlay(testLinks.node)
    const container = dom.find('.container')
    deepEqual(container?.links, [
      'http://localhost:3000/en',
      'http://localhost:3000/en/learn',
      'http://localhost:3000/en/about',
      'http://localhost:3000/en/download',
      'http://localhost:3000/en/guides',
      'http://localhost:3000/en/blog',
      'https://nodejs.org/docs/latest/api/',
      'https://openjsf.org/certification',
    ])
    const anchor = dom.find('a')
    deepEqual(anchor?.links, [])
  })

  test('getAttribute', async () => {
    const { dom } = await htmlPlay(testLinks.unsplash)
    const input = dom.find('input[type=search]')
    equal(input?.getAttribute('required'), '')
    equal(input?.getAttribute('xxx'), undefined)
    equal(input?.getAttribute('aria-controls'), 'react-autowhatever-1')
    equal(input?.getAttribute('spellcheck'), 'false')
  })

  test('find', async () => {
    const { dom } = await htmlPlay(testLinks.unsplash)
    const div = dom.find('div')
    ok(div)
    const xxx = dom.find('xxx')
    ok(!xxx)
  })

  test('findAll', async () => {
    const { dom } = await htmlPlay(testLinks.unsplash)
    const div = dom.findAll('div')
    equal(div.length, 817)
    const xxx = dom.findAll('xxx')
    deepEqual(xxx, [])
  })

  test('link and image with base tag', async () => {
    const { dom } = await htmlPlay(testLinks.base)
    const anchor = dom.find('a')
    equal(anchor?.link, 'http://example.com/link')
    const img = dom.find('img')
    equal(img?.image, 'http://example.com/image')
    const div = dom.find('div')
    equal(div?.backgroundImage, 'http://example.com/background')
  })

  test('images', async () => {
    const { dom } = await htmlPlay(testLinks.node)
    deepEqual(dom.images, [
      'http://localhost:3000/static/images/logo.svg',
      'http://localhost:3000/static/images/light-mode.svg',
      'http://localhost:3000/static/images/dark-mode.svg',
      'http://localhost:3000/static/images/language-picker.svg',
    ])
  })

  test('redirect', async () => {
    const { url } = await htmlPlay(testLinks.redirect, { browser: true })
    equal(url, 'http://localhost:3000/tests/html/node-js')
    notEqual(url, testLinks.redirect)
  })

  test('redirect should not work with fetch option', async () => {
    const { url } = await htmlPlay(testLinks.redirect)
    equal(url, testLinks.redirect)
  })

  test.only('json', async () => {
    const { json: json1 } = await htmlPlay(testLinks.json)
    deepEqual(json1, { a: 1 })
    const { json: json2 } = await htmlPlay(testLinks.json, { browser: true })
    deepEqual(json2, { a: 1 })
    const { json: json3 } = await htmlPlay(testLinks.node)
    equal(json3, undefined)
  })
})
