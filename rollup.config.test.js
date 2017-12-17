import nodeResolve from 'rollup-plugin-node-resolve';
import async from 'rollup-plugin-async'; // simple-get-json
import babel from 'rollup-plugin-babel';

export default [{
    input: 'tests/index.js',
    output: {
        file: 'build/index-node.js',
        format: 'umd',
        name: 'testImf'
    },
    plugins: [
        async(),
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
    input: 'tests/index.js',
    output: {
        file: 'build/index-browser.js',
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
}];
