import { MappingChars2StringEntries as entries } from '@/dic'
import { escapeStringRegexp } from '@/reg'
/**
 * @description 转义正则
 * @param selectors
 * @param raw
 * @returns
 */
export function escape (selectors: string, raw?: boolean) {
  let res = selectors
  for (let i = 0; i < entries.length; i++) {
    const [searchValue, replaceValue] = entries[i]
    res = res.replace(new RegExp((raw ? '\\\\' : '') + escapeStringRegexp(searchValue), 'g'), replaceValue)
  }
  return res
}
