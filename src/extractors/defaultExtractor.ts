/* eslint-disable no-useless-escape */
import * as regex from './regex'

interface IMockedContext {
  tailwindConfig: { separator: string; prefix: string }
}

export function defaultExtractor(context: IMockedContext) {
  const patterns = Array.from(buildRegExps(context))

  /**
   * @param {string} content
   */
  return (content: string) => {
    /** @type {(string|string)[]} */
    let results: string[] = []

    for (const pattern of patterns) {
      results = [...results, ...(content.match(pattern) ?? [])]
    }

    return results.filter((v) => v !== undefined).map(clipAtBalancedParens)
  }
}

function* buildRegExps(context: IMockedContext) {
  // -
  const separator = context.tailwindConfig.separator
  const variantGroupingEnabled = false
  const prefix = context.tailwindConfig.prefix !== '' ? regex.optional(regex.pattern([/-?/, regex.escape(context.tailwindConfig.prefix)])) : ''

  const utility = regex.any([
    // Arbitrary properties
    /\[[^\s:'"`]+:[^\s\]]+\]/,

    // Utilities
    regex.pattern([
      // Utility Name / Group Name
      /-?(?:\w+)/,

      // Normal/Arbitrary values
      regex.optional(
        regex.any([
          regex.pattern([
            // Arbitrary values
            /-(?:\w+-)*\[[^\s:]+\]/,

            // Not immediately followed by an `{[(`
            /(?![{([]])/,

            // optionally followed by an opacity modifier
            /(?:\/[^\s'"`\\><$]*)?/
          ]),

          regex.pattern([
            // Arbitrary values
            /-(?:\w+-)*\[[^\s]+\]/,

            // Not immediately followed by an `{[(`
            /(?![{([]])/,

            // optionally followed by an opacity modifier
            /(?:\/[^\s'"`\\$]*)?/
          ]),

          // Normal values w/o quotes — may include an opacity modifier
          /[-\/][^\s'"`\\$={><]*/
        ])
      )
    ])
  ])

  const variantPatterns = [
    // Without quotes
    regex.any([
      // This is here to provide special support for the `@` variant
      regex.pattern([/@\[[^\s"'`]+\](\/[^\s"'`]+)?/, separator]),

      regex.pattern([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]/, separator]),
      regex.pattern([/[^\s"'`\[\\]+/, separator])
    ]),

    // With quotes allowed
    regex.any([regex.pattern([/([^\s"'`\[\\]+-)?\[[^\s`]+\]/, separator]), regex.pattern([/[^\s`\[\\]+/, separator])])
  ]

  for (const variantPattern of variantPatterns) {
    yield regex.pattern([
      // Variants
      '((?=((',
      variantPattern,
      ')+))\\2)?',

      // Important (optional)
      /!?/,

      prefix,

      variantGroupingEnabled
        ? regex.any([
            // Or any of those things but grouped separated by commas
            regex.pattern([/\(/, utility, regex.zeroOrMore([/,/, utility]), /\)/]),

            // Arbitrary properties, constrained utilities, arbitrary values, etc…
            utility
          ])
        : utility
    ])
  }

  // 5. Inner matches
  yield /[^<>"'`\s.(){}[\]#=%$]*[^<>"'`\s.(){}[\]#=%:$]/g
}

// We want to capture any "special" characters
// AND the characters immediately following them (if there is one)
const SPECIALS = /([\[\]'"`])([^\[\]'"`])?/g
const ALLOWED_CLASS_CHARACTERS = /[^"'`\s<>\]]+/

/**
 * Clips a string ensuring that parentheses, quotes, etc… are balanced
 * Used for arbitrary values only
 *
 * We will go past the end of the balanced parens until we find a non-class character
 *
 * Depth matching behavior:
 * w-[calc(100%-theme('spacing[some_key][1.5]'))]']
 *   ┬    ┬          ┬┬       ┬        ┬┬   ┬┬┬┬┬┬┬
 *   1    2          3        4        34   3 210 END
 *   ╰────┴──────────┴────────┴────────┴┴───┴─┴┴┴
 *
 * @param {string} input
 */
function clipAtBalancedParens(input: string) {
  // We are care about this for arbitrary values
  if (!input.includes('-[')) {
    return input
  }

  let depth = 0
  const openStringTypes = []

  // Find all parens, brackets, quotes, etc
  // Stop when we end at a balanced pair
  // This is naive and will treat mismatched parens as balanced
  // This shouldn't be a problem in practice though
  let matches: IterableIterator<RegExpMatchArray> | RegExpMatchArray[] = input.matchAll(SPECIALS)

  // We can't use lookbehind assertions because we have to support Safari
  // So, instead, we've emulated it using capture groups and we'll re-work the matches to accommodate
  matches = Array.from(matches).flatMap((match) => {
    const [, ...groups] = match

    return groups.map((group, idx) =>
      Object.assign([], match, {
        // @ts-ignore
        index: match.index + idx,
        0: group
      })
    )
  })

  for (const match of matches) {
    const char = match[0]
    const inStringType: string = openStringTypes[openStringTypes.length - 1]

    if (char === inStringType) {
      openStringTypes.pop()
    } else if (char === "'" || char === '"' || char === '`') {
      openStringTypes.push(char)
    }

    if (inStringType) {
      continue
    } else if (char === '[') {
      depth++
      continue
    } else if (char === ']') {
      depth--
      continue
    }

    // We've gone one character past the point where we should stop
    // This means that there was an extra closing `]`
    // We'll clip to just before it
    if (depth < 0) {
      return input.substring(0, match.index)
    }

    // We've finished balancing the brackets but there still may be characters that can be included
    // For example in the class `text-[#336699]/[.35]`
    // The depth goes to `0` at the closing `]` but goes up again at the `[`

    // If we're at zero and encounter a non-class character then we clip the class there
    if (depth === 0 && !ALLOWED_CLASS_CHARACTERS.test(char)) {
      return input.substring(0, match.index)
    }
  }

  return input
}

// Regular utilities
// {{modifier}:}*{namespace}{-{suffix}}*{/{opacityModifier}}?

// Arbitrary values
// {{modifier}:}*{namespace}-[{arbitraryValue}]{/{opacityModifier}}?
// arbitraryValue: no whitespace, balanced quotes unless within quotes, balanced brackets unless within quotes

// Arbitrary properties
// {{modifier}:}*[{validCssPropertyName}:{arbitraryValue}]
