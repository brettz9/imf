import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
// import builtins from 'rollup-plugin-node-builtins';
import pkg from './package.json';

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
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
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
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
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
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
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
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
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
            main: true,
            browser: false,
            module: false,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ]
}];
