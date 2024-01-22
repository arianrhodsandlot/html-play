import { type JSDOM } from 'jsdom'

export { type JSDOM }
export type Element = InstanceType<JSDOM['window']['Element']>
export type HTMLAnchorElement = InstanceType<JSDOM['window']['HTMLAnchorElement']>
export type HTMLImageElement = InstanceType<JSDOM['window']['HTMLImageElement']>
