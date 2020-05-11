(function () {
    var charNameElement, charSymbolElement, loader, mainContent, charInputElement,
        REGEX_STR_HIGH_SURROGATE = '[\uD800-\uDBFF]',
        REGEX_STR_LOW_SURROGATE = '[\uDC00-\uDFFF]',
        REGEXP_SURROGATE_PAIR = new RegExp(REGEX_STR_HIGH_SURROGATE + REGEX_STR_LOW_SURROGATE, 'g'),
        REGEXP_LOW_SURROGATE = new RegExp(REGEX_STR_LOW_SURROGATE),
        REGEXP_ZERO_WIDTH_JOINER = new RegExp('\u200D', 'g'),
        REGEXP_VARIATION_SELECTOR = new RegExp('[\uFE00-\uFE0F]', 'g'),
        SHRUG = '¯\\_(ツ)_/¯',
        charMap = {},
        mappingRequests = [
            {
                nameIndex: 1,
                done: false,
                uri: '/ucd/UnicodeData.txt'
            },
            {
                nameIndex: 2,
                done: false,
                uri: '/emoji/emoji-sequences.txt'
            },
            {
                nameIndex: 2,
                done: false,
                uri: '/emoji/emoji-zwj-sequences.txt'
            }
        ];

    mappingRequests.forEach(function (request, index) {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                createMapping(this.responseText, request.nameIndex, index);
            }
        };
        http.open('GET', request.uri);
        http.send();
    });

    // init code that depends on elements
    function init () {
        charNameElement = document.querySelector('.char-name');
        charSymbolElement = document.querySelector('.char-symbol');
        loader = document.querySelector('.loader');
        mainContent = document.querySelector('.main-content');
        charInputElement = document.querySelector('#char-input');

        window.addEventListener('keydown', clearInput);
        window.addEventListener('paste', clearInput);
        charInputElement.addEventListener('input', handleInputData);
    }

    // convert raw unicode data to a mapping by character code
    function createMapping (responseText, nameIndex, index) {
        responseText
            .split('\n')
            .forEach(function (charCodeItem) {
                charCodeItem = charCodeItem.trim();
                if (!charCodeItem.length || charCodeItem.indexOf('#') === 0) { // ignore comments
                    return;
                }
                var charCodeData = charCodeItem.split(';');

                charMap[charCodeData[0].trim().toLowerCase()] = charCodeData[nameIndex].split('#')[0].trim().toUpperCase();
            });

        mappingRequests[index].done = true;

        if (mappingRequests.every(function (req) { return req.done; })) {
            loader.classList.add('hide');
            mainContent.classList.remove('hide');
            charInputElement.focus();
        }

    }

    function getMultiCodePointKey (multiCodePointChar) {
        var builtKeyArray = [];
     
        for (var i = 0; i < multiCodePointChar.length; i++) {
            // get the codePoint value for this character
            var aCodePoint = multiCodePointChar.codePointAt(i);
            // If this CodePoint is in the surrogate pair range but not part of a pair, discard it, as the codePointAt
            // implementation already looks ahead 1 additional character to get the correct code point
            // for surrogate pairs, and leaves an "orphan". See the polyfill implementation from MDN -
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/
            var codePointString = String.fromCodePoint(aCodePoint);

            if (codePointString.match(REGEXP_LOW_SURROGATE) && !codePointString.match(REGEXP_SURROGATE_PAIR)) {
                continue;
            }
            // convert to hex since codePointAt returns base 10, but Unicode mapping uses hex
            builtKeyArray.push(aCodePoint.toString(16));
        }

        return builtKeyArray.join(' ');
    }

    function getStringObject (string) {
        return {
            string: string,
            numberOfSurrogatePairs:  (string.match(REGEXP_SURROGATE_PAIR) || []).length,
            numberOfZWJs: (string.match(REGEXP_ZERO_WIDTH_JOINER) || []).length,
            numberOfVaritionSelectors: (string.match(REGEXP_VARIATION_SELECTOR) || []).length
        };
    }

    function handleInputData (event) {
        event.preventDefault();
        var stringObject = getStringObject(this.value);

        this.value = stringObject.string.slice(0, 1 + (stringObject.numberOfSurrogatePairs * 2) + stringObject.numberOfZWJs + stringObject.numberOfVaritionSelectors);
        
        var charMapKey = stringObject.numberOfSurrogatePairs > 1 ? getMultiCodePointKey(this.value) : getFourDigitHex(this.value.codePointAt(0));

        setCharNameDisplay(this.value, charMapKey);
    }

    function setCharNameDisplay (char, charMapKey) {
        charSymbolElement.innerText = char;
        charNameElement.innerText = charMap[charMapKey] || SHRUG;
    }

    function clearInput () {
        charInputElement.value = '';
    }

    function getFourDigitHex (num) {
        num = num.toString(16);
        if (num.length < 4) {
            num = ('0000' + num).substr(-4);
        }

        return num;
    }

    init();
})();
