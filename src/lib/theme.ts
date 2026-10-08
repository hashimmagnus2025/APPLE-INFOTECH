/** Chrome (nav, rail) theme switches between dark and light sections via a data attribute on <html>. */
export type ChromeTheme = 'dark' | 'light'
export function setChromeTheme(t: ChromeTheme) {
  if (document.documentElement.dataset.chrome !== t) document.documentElement.dataset.chrome = t
}
