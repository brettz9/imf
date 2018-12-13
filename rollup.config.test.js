import nodeResolve from 'rollup-plugin-node-resolve';

export default [{
    input: 'tests/index-node-entry.js',
    output: {
        file: 'tests/index-node.js',
        format: 'cjs'
    },
    plugins: [
        nodeResolve({
            main: true,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ]
}, {
    input: 'tests/index.js',
    output: {
        file: 'tests/index-browser.js',
        format: 'umd',
        name: 'testImf'
    },
    plugins: [
        nodeResolve({
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ]
}];
