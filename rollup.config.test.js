import nodeResolve from 'rollup-plugin-node-resolve';

export default [{
    input: 'tests/index.js',
    output: {
        file: 'tests/index-node.js',
        format: 'umd',
        name: 'testImf'
    },
    plugins: [
        nodeResolve({
            modulesOnly: true,
            main: false,
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
            modulesOnly: true,
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ]
}];
