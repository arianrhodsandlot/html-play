# Fetch-HTML

Fetch and parse dynamic HTMLs with Node.js like a boss 🕶.

> This project is highly inspired by the fabulous Python library [Requests-HTML](https://github.com/psf/requests-html).

## Features
- **Full JavaScript support!** (Using Chromium by default, thanks to Playwright).
- CSS Selectors.
- Intuitive APIs for extracting contents.


## Appetizer
```js
import { fetchHTML } from 'fetch-html'

// The content of this web page is rendered with JavaScript,
// so you won't get its real content by running:
// `await fetch(url)` or `curl $url`
const url = 'https://github.com/github/gitignore'

// But now we can retrieve it by Fetch-HTML with one line!
const { dom } = await fetchHTML(url)
const elements = dom.find('.react-directory-filename-column a')

// Will print:
// ['src', 'tests', 'package.json', 'tsconfig.json', ...]
console.log(elements.map(({ text }) => text))
```

## Installation
```sh
npm i fetch-html
```

## Recipes
### Download the today's Bing image.
```js
const { dom } = await fetchHTML('bing.com')
```

## APIs
### Methods
`fetchHTML`
```js
import { fetchHTML } from 'fetch-html'
```

### Classes

#### `Response`


#### `Element`
##### Properties
###### a

## License
[MIT](licenses)
