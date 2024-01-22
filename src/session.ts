import { type Browser, type LaunchOptions, type Page, chromium } from 'playwright'
import { buildDOM } from './lib/dom.js'
import { Response } from './response.js'

type SessionFunction = Session & Session['fetch']

interface FetchWithBrowserOptions {
  url: string
  browser: {
    browser?: Browser
    page?: Page
    launchOptions?: LaunchOptions
    beforeNavigate?: (context: { browser: Browser; page: Page }) => void | Promise<void>
    afterNavigate?: (context: { browser: Browser; page: Page }) => void | Promise<void>
  }
  fetch?: false
}

interface FetchWithoutBrowserOptions {
  url: string
  browser?: false
  fetch: {
    fetcher?: typeof fetch
    fetchInit?: RequestInit
  }
}

type FetchOptions =
  | { url: string }
  | { url: string; browser: true; fetch?: false }
  | { url: string; browser: false; fetch?: true }
  | { url: string; fetch: true }
  | FetchWithBrowserOptions
  | FetchWithoutBrowserOptions

type FetchArgs =
  | [string]
  | [FetchOptions]
  | [
      string,
      (
        | { browser: boolean }
        | { fetch: true }
        | Omit<FetchWithBrowserOptions, 'url'>
        | Omit<FetchWithoutBrowserOptions, 'url'>
      ),
    ]

const defaultFetchOptions = {}

const defaultBrowserOptions = {}

// eslint-disable-next-line sonarjs/cognitive-complexity
function normalizeOptions(args: FetchArgs): FetchWithBrowserOptions | FetchWithoutBrowserOptions {
  if (args.length === 1) {
    let [options] = args as any
    if (typeof options === 'string') {
      options = { url: options }
    }
    if (options.browser && options.fetch) {
      throw new Error('invalid options. Please do not specify both browser and fetch options.')
    }
    if (options.browser === false && options.fetch === false) {
      throw new Error('invalid options. Please do not specify both browser and fetch options.')
    }
    if (options.browser === false) {
      options.fetch = options.fetch || true
    }
    // defaults to fetch
    if (!options.browser && !options.fetch) {
      return { url: options.url, fetch: defaultFetchOptions }
    }
    if (options.fetch === true) {
      return { url: options.url, fetch: defaultFetchOptions }
    }
    if (options.browser === true) {
      return { url: options.url, browser: defaultBrowserOptions }
    }
    return options
  }

  if (args.length === 2) {
    const [url, options] = args
    if (typeof url !== 'string') {
      throw new TypeError('Invalid options. url must be a string.')
    }
    if (typeof options !== 'object') {
      throw new TypeError('Invalid options. options must be an object.')
    }
    return normalizeOptions([{ url, ...options }])
  }

  throw new Error('Invalid options.')
}

export class Session {
  private browserPromise: Promise<Browser> | undefined

  static create() {
    const session = new Session()
    // @ts-expect-error we need to declare a function first then assign its properties
    const sessionFunction: SessionFunction = session.fetch.bind(session)
    sessionFunction.fetch = session.fetch.bind(session)
    return sessionFunction
  }

  async fetch(...args: FetchArgs) {
    const normalizedOptions = normalizeOptions(args)

    if (normalizedOptions.browser) {
      return await this.fetchWithBrowser(normalizedOptions)
    }
    return await this.fetchWithoutBrowser(normalizedOptions)
  }

  private async launchBrowser(launchOptions?: LaunchOptions) {
    const browser = await this.browserPromise
    if (browser?.isConnected()) {
      return browser
    }

    // try {
    //   await access(chromium.executablePath())
    // } catch {
    //   console.info('Playwright is not installed. Auto installiing...')
    //   await promisify(spawn)('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' })
    // }

    this.browserPromise = chromium.launch(launchOptions)
    return await this.browserPromise
  }

  private async fetchWithBrowser(options: FetchWithBrowserOptions) {
    const { launchOptions, beforeNavigate, afterNavigate } = options.browser
    let { browser, page } = options.browser
    let needCloseBrowser = false
    if (!browser) {
      browser = await this.launchBrowser(launchOptions)
      needCloseBrowser = true
    }
    let needClosePage = false
    if (!page) {
      page = await browser.newPage()
      needClosePage = true
    }

    await beforeNavigate?.({ browser, page })
    const response = await page.goto(options.url, { waitUntil: 'networkidle' })
    await afterNavigate?.({ browser, page })

    const url = page.url()
    const status = response?.status() ?? 0
    const content = await page.content()

    if (needClosePage) {
      await page.close()
    }
    if (needCloseBrowser) {
      await browser.close()
    }

    const dom = buildDOM({ url, content })
    return new Response({ url, status, content, dom, rawBrowserResponse: response ?? undefined })
  }

  private async fetchWithoutBrowser(options: FetchWithoutBrowserOptions) {
    const fetcher = options.fetch.fetcher ?? fetch
    const response = await fetcher(options.url, options.fetch.fetchInit)
    const { url, status } = response
    const content = await response.text()
    const dom = buildDOM({ url, content })
    return new Response({ url, status, content, dom, rawFetchResponse: response })
  }
}

export const fetchHTML = Session.create()
