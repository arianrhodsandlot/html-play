import type { Response as PlaywrightResponse } from 'playwright'
import type { DOMElement } from './dom-element.js'

interface CommonResponseOptions {
  url: string
  status: number
  content: string
  dom: DOMElement
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
  dom: DOMElement
  rawBrowserResponse?: PlaywrightResponse
  rawFetchResponse?: globalThis.Response

  constructor(options: ResponseOptions) {
    const { url, status, content, dom } = options
    this.url = url
    this.status = status
    this.content = content
    this.dom = dom
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
