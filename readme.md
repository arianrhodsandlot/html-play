# Fetch-HTML

Fetch and parse dynamic HTMLs with Node.js like a boss 🕶.

> This project is highly inspired by the fabulous Python library [Requests-HTML](https://github.com/psf/requests-html).

## Features
- **Full JavaScript support!** (Using Chromium by default, thanks to [Playwright](https://playwright.dev/)).
- CSS Selectors.
- Intuitive APIs for extracting contents.

## Screenshot

## Installation
```sh
npm i fetch-html
```
We also need to install Chromium with Playwright. This cannot be skipped.
```sh
npx playwright install chromium
```

## Recipes
+ Let's get some wallpapers from unsplash.
  ```js
  const { dom } = await fetchHTML('https://unsplash.com/t/wallpapers')
  const elements = dom.findAll('img[itemprop=thumbnailUrl]')
  const images = elements.map(({ image }) => image?.split('?')[0])
  /* Will print something like
  ['https://images.unsplash.com/photo-1705834008920-b08bf6a05223', ...]
  */
  console.log(images)
  ```
+ Let's get some hacker news from Hack News.
  ```js
  const { dom } = await fetchHTML('https://news.ycombinator.com', {
    // Do not use Chromium to fetch the website since HN is not rendered in the browser.
    browser: false,
  })
  const titles = dom.findAll('.titleline')
  const news = titles.map(({ text, link }) => [text, link])
  /* Will print something like
  [
    ['news 1', 'http://xxx.com'],
    ['news 2', 'http://yyy.com'],
    ...
  ]
  */
  console.log(news)
  ```

## APIs
### Methods
`fetchHTML`
```js
import { fetchHTML } from 'fetch-html'
```

### Classes
#### `Response`


#### `DOMElement`
##### Properties
###### html
###### link

## Credits
+ [Requests-HTML](https://github.com/psf/requests-html)

## License
[MIT](licenses)
