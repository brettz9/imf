# CHANGES for `imf`

## ?

- Linting (LGTM): Add lgtm.yml

## 5.0.2

- npm: Update `intl-messageformat`, add `local-xmlhttprequest`
- npm: Update devDeps. and switch to compatible rollup-plugin-postprocess fork
- npm: Switch to pnpm

## 5.0.1

- npm: Update `simple-get-json`
- Dev security: Switch to server (`http-server`) without reported
    vulnerabilities
- Testing: Fix browser test

## 5.0.0

Adding additional version (after deprecation) to avoid bundling
`@babel/polyfill`:

- Breaking change: Export as named export (and add `IMFClass`)
- Breaking change: Drop `babel/polyfill` dependency
- Breaking build (Babel): Specify targets of Node 10 and Chrome 87 (and also use json extension)
- Linting (ESLint): Use recommended JSON extension
- Testing: Use `open-cli`; fix `basePath`
- Yarn: Remove lock file (switch to just package-lock)
- npm: Bump simple-get-json
- Maintenance: Add `.editorconfig`; remove remark

## 4.1.2

- Bump version to give deprecation notice in favor of `intl-dom`

## 4.1.1

- Fix: Avoid bundling in CJS build

## 4.1.0

- Build: Make CJS-specific build (to avoid need for
    regenerator-runtime/polyfill
- Testing: Since using polyglot file, must import polyfill
- npm: Add `prepublishOnly` script for yarn
- npm: Update devDeps

## 4.0.1

- Fix: Ensure `dist` includes `index-es6-polyglot.js`

## 4.0.0

- Breaking change: Add es6 polyglot distribution in `dist` and point to
    it from `package.json` `module` (also move sources to `src`)
- Fix: Node resolution was broken for building `dist/index.js`
- Enhancement: Add `@babel/polyfill` as dependency
- Linting (ESLint): Override "standard" for `object-curly-spacing`;
- npm: Update to Babel7 and other devDeps; rename `build` to `rollup`;
    remove unneeded `rollup-plugin-async`

## 3.0.1

- Fix: Browser build was not using browse-only modules
- npm: Update devDeps

## 3.0.0

- Build breaking change: Move builds to `dist`
- Build enhancement: Add ES6 module build
- Fix: Eliminate remaining global for pseudo-polyfill (`IntlMessageFormat`)
- npm: Update packaging files
- npm: Update simple-get-json and devDeps
- Testing: Make tests more cross-browser

## 2.1.1

- Fix `.npmignore`
- License: Rename LICENSE to LICENSE-MIT.txt
- npm: Update dep

## 2.1.0

- npm: Bump simple-get-json version
- npm: Update devDeps
- npm: Switch to babel-preset-env
- Build: Add Yarn lock

## 2.0.0

- Refactoring: Switch to ES6 Modules, arrow functions, etc. in source and tests
- npm: Add `browser` and `module` in `package.json` (and change `main`)
- Build: Node support
- Build: Have ES6 polyglot file support Node as well as browser (can rollup
    non-polyglot now as ES for browser without extra polyfill but have Rollup
    include `IntlMessageFormat` polyfill in `main` and `browser` builds in
    case needed in browser too (can still make a build based off `index-es6.js`
    without it)

## 1.0.2

- Properly ensure publishing current tagged version

## 1.0.0

- Switch to npm over bower

## 0.9.0

- Critical fix to message finding

## 0.8.0

- Change `fallbackLocale` property to `fallbackLocales` array. New
    property defaults to an empty array and is populated if
    `fallbackLanguages` is provided. All locales will be checked
    if `getFormatter` does not find a message within the `locales` property.

- Allow `fallbackLanguages` option to add results to `fallbackLocales`
    property even if no `callback` or `languages` option is provided
    upon instantiation.

- Supply retrieved `fallbackLocales` to be passed to the `callback` option
    as a fourth argument.

- Fix `callback` to be invoked on the IMF object (allowing it
    to access properties such as `locales`).

- Change default behavior of `getFormatter()` to utilize fallbacks
    unless the fourth `fallback` argument is explicitly set to `false`.

- Add `langs` option so that if `locales` are set without
    `languages` having been provided, corresponding language
    codes can be provided in error messages.

## 0.7.0

- Allow `locales` property to be set as an option at instantiation
    and added to by `loadLocales`.

## 0.6.0

- Add property `fallbackLanguages` and utilize in error messages

- Avoid setting `langs` property for fallback language (for
      `loadLocales` calls with `avoidSettingLocales` set to true)

## 0.5.0

- Cache Array.isArray, Allow array as ns+key argument or as
    separator-separated string

## 0.4.0

- Allow `fallback` to be a boolean instead of only a callback;
    will return message of the `fallbackLocale` (as may be determined
    by`fallbackLanguages`).

## 0.3.0

- Rename `fallbackLanguage` to `fallbackLanguages` for accuracy
    and parity with `languages`

## 0.2.0

- Allow formatter function to be supplied arguments as an object

- Add a `fallback` callback argument to the formatter function which,
    whenever a message cannot be found for `languages`, will be supplied
    a single object argument with properties, `message`, `langs`,
    `namespace`, `separator`, `key`, `values`, and `formats` and whose
    return value will be used for the return value of the formatter
    function. Note that `message` will contain the value for the message
    of the `fallbackLanguages` locale if `fallbackLanguage` (or
    `fallbackLocales`) had been supplied.

## 0.1.2

- Avoid bundling intl-messageformat dependency

## 0.1.1

- Bug: Avoid double-addition of separator for arrays
