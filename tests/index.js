/* globals IntlMessageFormat */
import {imf, IMF} from '../src/index.js';

const write = (...msgs) => {
    if (typeof document !== 'undefined') {
        document.body.append(
            ...msgs, ...Array.from({length: 2}, () => document.createElement('br'))
        );
    } else {
        console.log(...msgs);
    }
};

(async () => {
    const {_, namespacer} = await imf({languages: ['zh-CN', 'en-US']});
    // , enLocale, esLocale, ptLocale, zhCNLocale

    // Todo: Change to real tests and also include actual formatting examples!
    write(_('Localized value!')); // Looks up 'Localized value!' in Chinese file (at 'locales/zh-CN.json') and in English (at 'locales/en.json') if not present in Chinese

    const _tk = namespacer('tablekey');
    write(_tk('Tablekey localized value!')); // Equivalent to l('tablekey.Tablekey localized value!')

    const _tk2 = namespacer(['tablekey', 'nestedMore']);
    write(_tk2('Tablekey localized value2'));

    const _tk3 = namespacer('tablekey.nestedMore');
    write(_tk3('Tablekey localized value2'));

    const imfFallback = new IMF({
        languages: 'zh-CN',
        fallbackLanguages: 'en-US'
    });
    const {f} = await imfFallback.load();
    f({
        key: 'onlyInEnglish',
        fallback (res) {
            write(res.message);
        }
    });

    const msg = new IntlMessageFormat('', 'zh');
    console.log(msg.resolvedOptions().locale);

    const msg2 = new IntlMessageFormat('', 'zh-Hans');
    console.log(msg2.resolvedOptions().locale);
})();
