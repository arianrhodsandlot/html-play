import { deepEqual, equal, notEqual, ok } from 'node:assert'
import { type Server, createServer } from 'node:http'
import { describe, test } from 'node:test'
import serveHandler from 'serve-handler'
import { htmlPlay } from '../src/index.js'

describe('html-play', () => {
  const testLinks = {
    unsplash: 'http://localhost:3000/tests/html/unsplash',
    node: 'http://localhost:3000/tests/html/node',
    redirect: 'http://localhost:3000/tests/html/redirect',
    base: 'http://localhost:3000/tests/html/base',
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
    const { dom } = await htmlPlay(testLinks.unsplash)
    const element = dom.find('.irJsV')
    equal(element?.text, 'baconplancrowd of peopleantibioticsroleanalytics')
    equal(element?.rawText, 'baconplancrowd of peopleantibioticsroleanalytics')
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
})
