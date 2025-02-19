import { jsxHandler } from '#test/archived/jsx/v1'
import { createReplacer } from '#test/archived/jsx/replacer'
import { jsxCasePath, createGetCase } from './util'
import { jsxHandler as newJsxHandler } from '@/jsx/v2'

const getCase = createGetCase(jsxCasePath)

// const putCase = createPutCase(jsxCasePath)

describe('jsxHandler', () => {
  let reactReplacer: ReturnType<typeof createReplacer>
  let vue2Replacer: ReturnType<typeof createReplacer>
  let vue3Replacer: ReturnType<typeof createReplacer>

  beforeEach(() => {
    reactReplacer = createReplacer('react')
    vue2Replacer = createReplacer('vue')
    vue3Replacer = createReplacer('vue3')
  })
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const { code } = jsxHandler(item, reactReplacer)
    expect(newJsxHandler(item).code).toEqual(code)
    // await putCase('case1.result.js', result)

    expect(code).toMatchSnapshot()
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const { code } = jsxHandler(item, reactReplacer)
    // await putCase('case2.result.js', result)
    expect(newJsxHandler(item).code).toEqual(code)
    expect(code).toMatchSnapshot()
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const { code } = jsxHandler(item, reactReplacer)
    // await putCase('case3.result.js', result)
    expect(newJsxHandler(item).code).toEqual(code)
    expect(code).toMatchSnapshot()
  })

  it('react-hover-class', async () => {
    const item = await getCase('react-hover-class.js')
    const { code } = jsxHandler(item, reactReplacer)
    expect(newJsxHandler(item).code).toEqual(code)
    expect(code).toMatchSnapshot()
  })

  it('vue2-case1', async () => {
    const item = await getCase('vue2-case1.js')
    const { code } = jsxHandler(item, vue2Replacer)
    expect(
      newJsxHandler(item, {
        framework: 'vue2'
      }).code
    ).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  test('vue2-hover-class.js', async () => {
    const item = await getCase('vue2-hover-class.js')
    const { code } = jsxHandler(item, vue2Replacer)
    expect(
      newJsxHandler(item, {
        framework: 'vue2'
      }).code
    ).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  it('vue3-createStaticVNode.js', async () => {
    const item = await getCase('vue3-createStaticVNode.js')

    const { code } = jsxHandler(item, vue3Replacer)
    expect(
      newJsxHandler(item, {
        framework: 'vue3'
      }).code
    ).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  it('vue3-render.js', async () => {
    const item = await getCase('vue3-render.js')

    const { code } = jsxHandler(item, vue3Replacer)
    expect(
      newJsxHandler(item, {
        framework: 'vue3'
      }).code
    ).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  it('vue3-hover-class.js', async () => {
    const item = await getCase('vue3-hover-class.js')

    const { code } = jsxHandler(item, vue3Replacer)
    expect(
      newJsxHandler(item, {
        framework: 'vue3'
      }).code
    ).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  it('react-jsx-loader-case0', async () => {
    const item = await getCase('react-jsx-loader-case0.js')

    const { code } = jsxHandler(item, reactReplacer)
    expect(newJsxHandler(item).code).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  it('react-jsx-loader-case1', async () => {
    const item = await getCase('react-jsx-loader-case1.js')

    const { code } = jsxHandler(item, reactReplacer)
    expect(newJsxHandler(item).code).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  it('react-jsx-loader-case-with-vars', async () => {
    const item = await getCase('react-jsx-loader-case-with-vars.js')

    const { code } = jsxHandler(item, reactReplacer)
    expect(newJsxHandler(item).code).toEqual(code)

    expect(code).toMatchSnapshot()
  })

  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  it('multiple file no end issue', async () => {
    const standaloneReactReplacer = createReplacer('react')

    jsxHandler(
      `_jsx(View, {
      className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
    })`,
      standaloneReactReplacer
    )

    const { code } = jsxHandler(
      `import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
    import './index.scss'
    import { jsx as _jsx } from 'react/jsx-runtime'
    import { jsxs as _jsxs } from 'react/jsx-runtime'
    import { Fragment as _Fragment } from 'react/jsx-runtime'`,
      standaloneReactReplacer
    )
    expect(code).toMatchSnapshot()
  })
})
