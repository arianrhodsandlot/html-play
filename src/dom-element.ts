import { URL } from 'node:url'
import { type Element, type HTMLAnchorElement, type HTMLImageElement, type JSDOM } from './lib/types.js'

export class DOMElement<T extends Element = Element> {
  dom: JSDOM
  element: T
  private url: string
  private baseURL: string

  constructor({ dom, element, url, baseURL }: { dom: JSDOM; element: T; url: string; baseURL: string }) {
    this.dom = dom
    this.element = element
    this.url = url
    this.baseURL = baseURL
  }

  get html() {
    return this.element.outerHTML ?? ''
  }

  get link() {
    if (this.selfLink) {
      return this.selfLink
    }
    return this.links[0]
  }

  get links() {
    return this.anchorChildren.map(({ element: { href } }) => href)
  }

  get rawText() {
    return this.element.textContent ?? ''
  }

  get text() {
    return this.rawText.replaceAll(/\s\s+/g, ' ').trim()
  }

  get image() {
    return this.selfImage || this.images[0] || undefined
  }

  get images() {
    if (this.selfImage) {
      return [this.selfImage]
    }
    return this.imageChildren.filter(({ element: { src } }) => src).map(({ element: { src } }) => this.resolveURL(src))
  }

  get backgroundImage() {
    // @ts-expect-error the actual type of element is unclear here
    const backgroundImage = this.element?.style?.backgroundImage ?? this.element?.style?.background ?? ''
    if (!backgroundImage) {
      return ''
    }
    const backgroundImageURL = backgroundImage.slice(4, -1).replaceAll(/["']/g, '')
    return this.resolveURL(backgroundImageURL)
  }

  private get selfImage() {
    if (this.element.tagName === 'IMG') {
      return (this.element as unknown as HTMLImageElement).src
    }
    return ''
  }

  private get selfLink() {
    if (this.element.tagName === 'A') {
      return (this.element as unknown as HTMLAnchorElement).href
    }
    return ''
  }

  private get anchorChildren() {
    return this.findAll<HTMLAnchorElement>('a')
  }

  private get imageChildren() {
    return this.findAll<HTMLImageElement>('img')
  }

  getAttribute(qualifiedName: string) {
    return this.element.getAttribute(qualifiedName) ?? undefined
  }

  find<T extends Element = Element>(selector: string, options: { containing?: string } = {}) {
    const { dom, element, url, baseURL } = this
    const { containing } = options

    const nodeList = element.querySelectorAll<T>(selector)
    for (const node of nodeList) {
      const isTarget = containing ? node.textContent?.includes(containing) : true
      if (isTarget) {
        return new DOMElement({ dom, element: node, url, baseURL })
      }
    }
  }

  findAll<T extends Element = Element>(selector: string, options: { containing?: string } = {}) {
    const { dom, element, url, baseURL } = this
    const { containing } = options

    const results = []
    const nodeList = element.querySelectorAll<T>(selector)
    for (const node of nodeList) {
      const isTarget = containing ? node.textContent?.includes(containing) : true
      if (isTarget) {
        const result = new DOMElement({ dom, element: node, url, baseURL })
        results.push(result)
      }
    }
    return results
  }

  private resolveURL(url: string) {
    const { baseURL } = this
    return new URL(url, baseURL).href
  }
}
