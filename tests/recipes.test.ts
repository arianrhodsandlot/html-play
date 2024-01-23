import { ok } from 'node:assert'
import { describe, test } from 'node:test'
import { playHTML } from '../src/index.js'

describe('recipes', () => {
  test('fetch the wallpaper from Bing', async () => {
    const url = 'https://bing.com'
    const { dom } = await playHTML(url, { browser: true })
    const img = dom.find('.img_cont')
    ok(img?.backgroundImage.includes('/th?id='))
  })

  test('fetch wallpapers from Unsplash', async () => {
    const url = 'https://unsplash.com/t/wallpapers'
    const { dom } = await playHTML(url)
    const images = dom.findAll('img[itemprop=thumbnailUrl]').map(({ image }) => image?.split('?')[0])
    const validPrefixes = ['https://images.unsplash.com/photo-', 'https://plus.unsplash.com/premium_photo-']
    for (const image of images) {
      ok(validPrefixes.some((prefix) => image?.startsWith(prefix)))
    }
  })

  test('fetch titles from Hacker News', async () => {
    const url = 'https://news.ycombinator.com'
    const { dom } = await playHTML(url)
    const titles = dom.findAll('.titleline')
    const news = titles.map(({ text, link }) => [text, link])
    for (const [text, link] of news) {
      ok(text)
      ok(link.startsWith('http'))
    }
  })
})
