import nodeResolve from 'rollup-plugin-node-resolve';
import async from 'rollup-plugin-async'; // simple-get-json

export default [{
    input: 'tests/index.js',
    output: {
        file: 'tests/index-node.js',
        format: 'umd',
        name: 'testImf'
    },
    plugins: [
        async(),
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
        format: 'es',
        name: 'testImf'
    },
    plugins: [
        async(),
        nodeResolve({
            modulesOnly: true,
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ]
}];
