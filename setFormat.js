// If strawman approved and implemented, this entrance file would not be
//   necessary and `index-es6.js` (or `index-es6-polyglot.js` for Node)
//   could be used by default instead

import {IMFFormatter, IMF} from './index-es6.js';

import {
    getLocalizedIntlMessageFormat, IntlMessageFormat, locales
} from './intl-messageformat-with-locales.js';

// Requested sync loading at https://github.com/yahoo/intl-messageformat/issues/174#issuecomment-350638974
async function getLocalizedIMF () {
    const IntlMessageFormatLocalized = await getLocalizedIntlMessageFormat();
    class LocalizedIMF extends IntlMessageFormatLocalized {
        setMessageFormat () {
            return super(IntlMessageFormatLocalized);
        }
    }
    return LocalizedIMF;
};

function getIMF ({localized}) {
    const IMFClass = localized
        ? getLocalizedIMF()
        : Promise.resolve(IMF);
    return {IMF: IMFClass, IMFFormatter: IMFFormatter.bind(IMFClass)};
}

export {getIMF, getLocalizedIMF, IntlMessageFormat, locales, IMF, IMF as default};
