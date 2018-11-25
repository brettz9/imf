import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

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
}];
