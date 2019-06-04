import babel from 'rollup-plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
// import builtins from 'rollup-plugin-node-builtins';
import pkg from './package.json';

// eslint-disable-next-line import/no-anonymous-default-export
export default [{
  input: 'src/index-es6.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'IMF'
  },
  plugins: [
    babel(),
    nodeResolve({
      modulesOnly: true,
      // intl-messageformat was still using
      //   instead of `module`
      mainFields: ['module', 'jsnext']
    })
  ]
}, {
  input: 'src/index-es6.js',
  output: {
    file: 'dist/index-es6.js',
    format: 'es',
    name: 'IMF'
  },
  plugins: [
    babel(),
    nodeResolve({
      modulesOnly: true,
      // intl-messageformat was still using
      //  instead of `module`
      mainFields: ['module', 'jsnext']
    })
  ]
}, {
  input: 'src/index-es6-polyglot.js',
  output: {
    file: 'dist/index-polyglot.js',
    format: 'umd',
    name: 'IMF'
  },
  plugins: [
    babel(),
    nodeResolve({
      modulesOnly: true,
      // intl-messageformat was still using
      //  instead of `module`
      mainFields: ['module', 'jsnext']
    })
  ]
}, {
  input: 'src/index-es6-polyglot.js',
  output: {
    file: 'dist/index-es6-polyglot.js',
    format: 'es',
    name: 'IMF'
  },
  plugins: [
    babel(),
    nodeResolve({
      modulesOnly: true,
      // intl-messageformat was still using
      //  instead of `module`
      mainFields: ['module', 'jsnext']
    })
  ]
}, {
  input: 'src/index-es6-polyglot.js',
  output: {
    file: 'dist/index-cjs.js',
    format: 'cjs'
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    babel({
      babelrc: false
    }),
    nodeResolve({
      preferBuiltins: true,
      // intl-messageformat was still using
      //  instead of `module`
      mainFields: ['main', 'jsnext']
    })
  ]
}];
