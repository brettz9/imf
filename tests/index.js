import IMF from '../index-es6.js';

const write = (...msgs) => {
    if (typeof document !== 'undefined') {
        document.body.append(
            ...msgs, ...Array.from({length: 2}, () => document.createElement('br'))
        );
    } else {
        console.log(...msgs);
    }
};
IMF({
    languages: ['zh-CN', 'en-US'],
    callback: function (l, getFormatter) { // , enLocale, esLocale, ptLocale, zhCNLocale
        write(l('Localized value!')); // Looks up 'Localized value!' in Chinese file (at 'locales/zh-CN.json') and in English (at 'locales/en.json') if not present in Chinese
        const tk = getFormatter('tablekey');
        write(tk('Tablekey localized value!')); // Equivalent to l('tablekey.Tablekey localized value!')

        const tk2 = getFormatter(['tablekey', 'nestedMore']);
        write(tk2('Tablekey localized value2'));

        const tk3 = getFormatter('tablekey.nestedMore');

        write(tk3('Tablekey localized value2'));

        IMF({
            languages: 'zh-CN',
            fallbackLanguages: 'en-US',
            callback: function (l, getFormatter) {
                l({
                    key: 'onlyInEnglish',
                    fallback (res) {
                        write(res.message);
                    }
                });
            }
        });
    }
});
