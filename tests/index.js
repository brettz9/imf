/* globals IntlMessageFormat */
import {getIMF} from '../setFormat.js';

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
    const {IMF, IMFFormatter} = await getIMF({localized: true});

    const {f, makeSubFormatter} = await IMFFormatter({languages: ['zh-CN', 'en-US']});
    // , enLocale, esLocale, ptLocale, zhCNLocale

    // Todo: Change to real tests and also include actual formatting examples!
    write(f('Localized value!')); // Looks up 'Localized value!' in Chinese file (at 'locales/zh-CN.json') and in English (at 'locales/en.json') if not present in Chinese

    const tkf = makeSubFormatter('tablekey');
    write(tkf('Tablekey localized value!')); // Equivalent to l('tablekey.Tablekey localized value!')

    const tkf2 = makeSubFormatter(['tablekey', 'nestedMore']);
    write(tkf2('Tablekey localized value2'));

    const tkf3 = makeSubFormatter('tablekey.nestedMore');
    write(tkf3('Tablekey localized value2'));

    const imfFallback = IMF({
        languages: 'zh-CN',
        fallbackLanguages: 'en-US'
    });
    const {_} = await imfFallback.formattersAndLocales();
    _({
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
