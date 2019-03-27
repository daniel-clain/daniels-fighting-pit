import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import builtins from 'rollup-plugin-node-builtins';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/client/global/app.scss',
  globalScript: 'src/client/global/app.ts',
  plugins: [    
    sass(),
    builtins()
  ],
  nodeResolve: {
    browser: true,
    preferBuiltins: true
  },  
  copy: [{
    src: require('path').resolve('./src/client/assets'),
    dest: 'assets'
  }],
  outputTargets: [
    {
      type: 'www',
      // uncomment the following line to disable service workers in production
      // serviceWorker: null
    }
  ]
};
