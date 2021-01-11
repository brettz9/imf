/* eslint-env node */
import IntlMessageFormat from 'intl-messageformat';
import {IMF, IMFClass} from './index-es6.js';

if (typeof global !== 'undefined') {
    global.IntlMessageFormat = IntlMessageFormat;
}

export {IMF, IMFClass};
