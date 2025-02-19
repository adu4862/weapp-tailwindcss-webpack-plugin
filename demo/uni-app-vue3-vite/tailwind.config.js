const plugin = require('tailwindcss/plugin');
const { each, variants } = require('./variants.js');
const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.resolve(__dirname, './variants.json'), JSON.stringify(variants, null, 2), {
  encoding: 'utf-8',
});
const { plugin: tailwindcssChildrenPlugin } = require('weapp-tailwindcss-children');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#45a3fa',
      },
    },
  },
  plugins: [
    tailwindcssChildrenPlugin,
    // plugin(({ addVariant }) =>
    //   each((x) => {
    //     addVariant(...x)
    //     // addVariant('optional', '&:optional');
    //     // addVariant('group-optional', ':merge(.group):optional &');
    //     // addVariant('peer-optional', ':merge(.peer):optional ~ &');
    //   })
    // )
  ],
  presets: [
    require('tailwindcss-rem2px-preset').createPreset({
      fontSize: 32,
      unit: 'rpx',
    }),
  ],
  corePlugins: {
    preflight: false,
  },
};
