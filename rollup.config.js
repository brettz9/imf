import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import builtins from 'rollup-plugin-node-builtins';
import pkg from './package.json';

export default [{
    input: 'src/index-es6.js',
    output: [{
        file: 'dist/index.js',
        format: 'umd',
        name: 'IMF'
    }, {
        file: 'dist/index-es6.js',
        format: 'es',
        name: 'IMF'
    }],
    plugins: [
        nodeResolve({
            mainFields: ['module', 'main']
        }),
        commonjs(),
        babel({
            babelHelpers: 'bundled'
        })
    ]
}, {
    input: 'src/index-es6-polyglot.js',
    output: [{
        file: 'dist/index-polyglot.js',
        format: 'umd',
        name: 'IMF'
    }, {
        file: 'dist/index-es6-polyglot.js',
        format: 'es',
        name: 'IMF'
    }],
    plugins: [
        babel({
            babelHelpers: 'bundled'
        }),
        nodeResolve({
            mainFields: ['module', 'main']
        }),
        commonjs()
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
            babelHelpers: 'bundled',
            babelrc: false
        }),
        nodeResolve({
            preferBuiltins: true,
            mainFields: ['main']
        }),
        commonjs()
    ]
}];
