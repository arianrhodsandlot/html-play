import { JSDOM } from 'jsdom'
import { DOMElement } from '../dom-element.js'

export function buildDOM(options: string | { url?: string; content?: string }) {
  const finalOptions = typeof options === 'string' ? { content: options } : options
  const { url = 'about:blank', content = '' } = finalOptions

  const dom = new JSDOM(content, { url })
  const rootElement = dom.window.document.documentElement

  let baseURL = url
  const baseElement = rootElement.querySelector('base')
  if (baseElement) {
    baseURL = new URL(baseElement.href, url).href
  }

  return new DOMElement({ dom, element: rootElement, url, baseURL })
}
