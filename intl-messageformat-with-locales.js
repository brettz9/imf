/* globals global */
import IntlMessageFormat from 'intl-messageformat';
import locales from './locales.js';

// Needed to allow the non-modular scripts loaded below to work
const glob = typeof window !== 'undefined' ? window : global;
glob.IntlMessageFormat = IntlMessageFormat;

// https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval
const rollupSaferGlobalEval = eval; // eslint-disable-line no-eval

// Todo: move this to `load`
// If expressed as a module (requested sync loading
//  at https://github.com/yahoo/intl-messageformat/issues/174#issuecomment-350638974 )
// could use https://github.com/tc39/proposal-dynamic-import#example until dynamic imports
// given that this should only be conditionally loaded
async function getLocalizedIntlMessageFormat () {
    await Promise.all(locales.map(async (locale) => {
        const req = await fetch(`/node_modules/intl-messageformat/dist/locale-data/${locale}.js`);
        const jsText = await req.text();
        rollupSaferGlobalEval(
            jsText
        );
    }));
    return IntlMessageFormat;
};

export {IntlMessageFormat, getLocalizedIntlMessageFormat, locales};
