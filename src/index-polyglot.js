/* eslint-env node */
import IntlMessageFormat from 'intl-messageformat';
import {IMF, imf} from './index.js';

if (typeof global !== 'undefined') {
    global.IntlMessageFormat = IntlMessageFormat;
} else {
    window.IntlMessageFormat = IntlMessageFormat;
}

export {IMF, imf, imf as default};
