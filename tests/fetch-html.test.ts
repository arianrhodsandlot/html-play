import { deepEqual, equal, notEqual } from 'node:assert'
import { type Server, createServer } from 'node:http'
import { describe, test } from 'node:test'
import serveHandler from 'serve-handler'
import { fetchHTML } from '../src/index.js'

describe.only('fetch-html', () => {
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

  test('text', async () => {
    const { dom } = await fetchHTML(testLinks.unsplash, { fetch: true })
    const element = dom.find('.irJsV')
    equal(element?.text, 'baconplancrowd of peopleantibioticsroleanalytics')
  })

  test.only('link and image with base tag', async () => {
    const { dom } = await fetchHTML(testLinks.base, { fetch: true })
    const anchor = dom.find('a')
    equal(anchor?.link, 'http://example.com/link')
    equal(anchor?.rawLink, 'link')
    const img = dom.find('img')
    equal(img?.image, 'http://example.com/image')
  })

  test('images', async () => {
    const { dom } = await fetchHTML(testLinks.node)
    deepEqual(dom.images, [
      'http://localhost:3000/tests/html/node-js_files/logo.svg',
      'http://localhost:3000/tests/html/node-js_files/light-mode.svg',
      'http://localhost:3000/tests/html/node-js_files/dark-mode.svg',
      'http://localhost:3000/tests/html/node-js_files/language-picker.svg',
    ])
  })

  test('redirect', async () => {
    const { url } = await fetchHTML(testLinks.redirect)
    equal(url, 'http://localhost:3000/tests/html/node-js')
    notEqual(url, testLinks.redirect)
  })

  test('redirect should not work with fetch option', async () => {
    const { url } = await fetchHTML(testLinks.redirect, { fetch: true })
    equal(url, testLinks.redirect)
  })
})
