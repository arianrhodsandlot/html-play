import type { Response as PlaywrightResponse } from 'playwright'
import type { DOMElement } from './dom-element.js'
import { buildDOM } from './lib/dom.js'

interface CommonResponseOptions {
  url: string
  status: number
  content: string
  initialContent?: string
}

interface BrowserResponseOptions extends CommonResponseOptions {
  rawBrowserResponse?: PlaywrightResponse
}

interface FetchResponseOptions extends CommonResponseOptions {
  rawFetchResponse?: globalThis.Response
}

type ResponseOptions = BrowserResponseOptions | FetchResponseOptions

export class Response {
  url: string
  status: number
  content: string
  json: any
  dom: DOMElement
  rawBrowserResponse?: PlaywrightResponse
  rawFetchResponse?: globalThis.Response

  constructor(options: ResponseOptions) {
    const { url, status, content, initialContent = content } = options
    this.url = url
    this.status = status
    this.content = content
    this.dom = buildDOM({ url, content })

    try {
      this.json = JSON.parse(initialContent)
    } catch {}

    if ('rawBrowserResponse' in options) {
      const { rawBrowserResponse } = options
      this.rawBrowserResponse = rawBrowserResponse
    }
    if ('rawFetchResponse' in options) {
      const { rawFetchResponse } = options
      this.rawFetchResponse = rawFetchResponse
    }
  }
}
