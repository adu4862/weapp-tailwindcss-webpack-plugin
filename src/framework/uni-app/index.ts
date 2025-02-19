import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV4 } from '@/base'

export class UniAppWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
