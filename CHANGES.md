# 0.5.0
- Cache Array.isArray, Allow array as ns+key argument or as separator-separated string

# 0.4.0
- Allow `fallback` to be a boolean instead of only a callback; will return message of the `fallbackLocale` (as may be determined by`fallbackLanguages`).

# 0.3.0
- Rename `fallbackLanguage` to `fallbackLanguages` for accuracy and parity with `languages`

# 0.2.0
- Allow formatter function to be supplied arguments as an object
- Add a `fallback` callback argument to the formatter function which, whenever a message cannot be found for `languages`, will be supplied a single object argument with properties, `message`, `langs`, `namespace`, `separator`, `key`, `values`, and `formats` and whose return value will be used for the return value of the formatter function. Note that `message` will contain the value for the message of the `fallbackLanguages` locale if `fallbackLanguage` (or `fallbackLocales`) had been supplied.

# 0.1.2
- Avoid bundling intl-messageformat dependency

# 0.1.1
- Bug: Avoid double-addition of separator for arrays
