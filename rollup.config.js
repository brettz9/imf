/* eslint-env node */
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import async from 'rollup-plugin-async'; // simple-get-json
import json from 'rollup-plugin-json';

const fs = require('fs');
const path = require('path');
const dir = './node_modules/intl-messageformat/dist/locale-data';
const dirPath = path.join(__dirname, dir);
const locales = JSON.stringify(fs.readdirSync(dirPath).map((f) => f.replace(/.js$/, '')));
fs.writeFileSync('./src/locales.js', `export default ${locales}`);

export default [{
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'IMF'
    },
    plugins: [
        async(),
        babel(),
        nodeResolve({
            modulesOnly: true,
            main: false,
            browser: true,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ]
}, {
    input: 'src/index.js',
    output: {
        file: 'dist/index-es6.js',
        format: 'es'
    }
}, {
    input: 'src/index-polyglot.js',
    output: {
        file: 'dist/index-polyglot-es6.js',
        format: 'es'
    }
}, {
    input: 'src/index-polyglot.js',
    output: {
        file: 'dist/index-polyglot.js',
        format: 'umd'
    }
}].map((exp) => {
    exp.output.name = 'IMF';
    exp.plugins = [
        json(),
        async(),
        babel(),
        nodeResolve({
            modulesOnly: true,
            main: false,
            browser: false,
            module: true,
            jsnext: true // intl-messageformat is still using instead of `module`
        })
    ];
    return exp;
});
