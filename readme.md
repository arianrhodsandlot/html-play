# Play-HTML

Fetch and parse web pages with Node.js like a boss 🕶.

## Features
+ **Full JavaScript support!** (Using Chromium by default, thanks to [Playwright](https://playwright.dev/)).
+ CSS Selectors.
+ Mocked user-agent (like a real web browser).
+ Intuitive APIs for extracting useful contents like links and images.

## Recipes
+ Grab a list of all links on the page.
  ```js
  import { playHTML } from 'play-html'

  const { dom } = await playHTML('https://nodejs.org')
  // Will print all links on the page
  console.log(dom.links)
  ```

+ Select an element with a CSS selector.
  ```js
  import { playHTML } from 'play-html'

  const { dom } = await playHTML('https://nodejs.org')
  // Will print: 'Node.js® is an open-source, cross-platform...'
  console.log(dom.find('#home-intro').text)
  ```

<details>
  <summary>Expand to view more recipes.</summary>

+ Let's grab some wallpapers from unsplash.
  ```js
  import { playHTML } from 'play-html'

  const { dom } = await playHTML('https://unsplash.com/t/wallpapers')
  const elements = dom.findAll('img[itemprop=thumbnailUrl]')
  const images = elements.map(({ image }) => image)
  // Will print something like
  // ['https://images.unsplash.com/photo-1705834008920-b08bf6a05223', ...]
  console.log(images)
  ```
+ Let's load some hacker news from Hack News.
  ```js
  import { playHTML } from 'play-html'

  const { dom } = await playHTML('https://news.ycombinator.com')
  const titles = dom.findAll('.titleline')
  const news = titles.map(({ text, link }) => [text, link])
  // Will print something like
  // [['news 1', 'http://xxx.com'], ['news 2', 'http://yyy.com'], ...]
  console.log(news)
  ```
+ Load a dynamic website, which means its content is generated by JavaScript!
  ```js
  // Search for images of "flower" with Google
  import { playHTML } from 'play-html'

  const { dom } = await playHTML('https://www.google.com/search?&q=flower&tbm=isch')
  // Filtering is still needed if you want this work...
  console.log(dom.images)
  ```
+ Send requests with custom cookies.
  ```js
  import { playHTML } from '../src/index.js'

  const { dom } = await playHTML('https://httpbin.org/cookies', {
    fetch: { fetchInit: { headers: { Cookie: 'a=1; b=2;' } } },
  })
  // Will print { "cookies": { "a": "1", "b": "2" } }
  console.log(dom.text)
  ```
</details>

## Installation
```sh
npm i play-html
```
If you want to use a browser to "run" the page before parsing, you'll need to install Chromium with Playwright.
```sh
npx playwright install chromium
```

## APIs
+ ### Methods
  #### `playHTML`

  Fetch a certain URL and return response and parsed DOM.

  ##### Example:
  ```js
  import { playHTML } from 'play-html'

  const { dom } = await playHTML('http://example.com')
  ```

  ##### Parameters:
  + `url`

    Type: `string`

    The URL to fetch.

  + `options`

    Type: `object`

    Default: `{ fetch: true }`

    + `fetch`

      Type: `boolean | object`

      If set to `true`, we will use the Fetch API to load the requested URL. You can also specify the options for the Fetch API by passing an `object` here.

      + `fetcher`

        Type: `function`

        The fetch function we are going to use. We can pass a polyfill here.

      + `fetchInit`

        Type: `function`

        The fetch parameters passed to the fetch function. See [fetch#options](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options). You can set HTTP headers or cookies here.

    + `browser`

      Type: `boolean | object`

      If set to `true`, we will use Playwright to load the requested URL. You can also specify the options for Playwright by passing an `object` here.

      + `browser`

        The Playwright Browser instance to use.

      + `page`

        The Playwright Page instance to use.

      + `launchOptions`

        The `launchOptions` passed to Playwright when we are launching the browser. See [BrowserType#browser-type-launch](https://playwright.dev/docs/api/class-browsertype#browser-type-launch)

      + `beforeNavigate`

        A custom hook function that will be called before the page is loaded. `page` and `browser` can be accessed here as the properties of its first parameter to interact with the page.

      + `afterNavigate`

        A custom hook function that will be called after the page is loaded. `page` and `browser` can be accessed here as the properties of its first parameter to interact with the page.

  ##### Returns:
  A `Promise` of [`Response`](#Response) instance (see below).

+ ### Classes
  #### `Response`
  ##### Properties
  + `url`

    The URL of the response. If the response is redirected from another URL, the value will be the final redirected URL.

  + `status`

    The HTTP status code of the response.

  + `content`

    The response content as a plain string.

  + `dom`

    The parsed root DOM. See [`DOMElement`](#DOMElement).

  + `rawBrowserResponse`

    The raw response object returned by Playwright.

  + `rawFetchResponse`

    The raw response object returned by the Fetch API.

  #### `DOMElement`
  ##### Properties
  + `html`

    The "[`outerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML)" of this element.

  + `link`

    If the element is an [anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a), this will be the absolute value of the element's link, or it will be an empty string.

  + `links`

    All the [anchor elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) inside this element.

  + `text`

    The text of the element with whitespaces stripped.

  + `rawText`

    The original text of the element.

  + `image`

    If the element is an [image embed element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img), this will be the absolute URL of the element's image, or it will be an empty string.

  + `images`

    All the image URLs inside this element.

  + `backgroundImage`

    The background image source extracted from the element's inline style.

  + `element`

    The corresponding `JSDOM` element object.

  ##### Methods
  + `find`

    Find the first matched child `DOMElement` inside this element.

    ##### Parameters
    + `selector`

      CSS Selector to use.

      Type: `string`

    + `options`

      Type: `object`

      + `containing`

        Check if the element contains the specified substring.

        Type: `string`
  + `findAll`

    Find all matched child `DOMElement`s inside this element.

    ##### Parameters
    + `selector`

      CSS Selector to use.

      Type: `string`

    + `options`

      Type: `object`

      + `containing`

        Check if the element contains the specified substring.

        Type: `string`

  + `getAttribute`
    ##### Parameters
    + `qualifiedName`

      Type: `string`

      Returns element's first attribute whose qualified name is qualifiedName, and `undefined` if there is no such attribute otherwise.


## Credits
This project is highly inspired by the fabulous Python library [Requests-HTML](https://github.com/psf/requests-html).

## License
[MIT](licenses)
