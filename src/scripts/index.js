(function () {
    var charNameElement, charSymbolElement, loader, mainContent, charInputElement,
        SHRUG = '¯\\_(ツ)_/¯',
        charMap = {},
        mappingRequests = [
            {
                nameIndex: 1,
                done: false,
                uri: '/ucd/UnicodeData.txt'
                // cb: function () { createMapping(1); }
            },
            {
                nameIndex: 2,
                done: false,
                uri: '/emoji/emoji-sequences.txt'
                // cb: function () { createMapping(2); }
            },
            {
                nameIndex: 2,
                done: false,
                uri: '/emoji/emoji-zwj-sequences.txt'
                // cb: function () { createMapping(2);  }
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

    // init page, or wait for DOMContentLoaded to init page
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

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

                // console.log(charCodeData[0].toLowerCase() +  ' => ' + charCodeData[nameIndex].split('#')[0].toUpperCase());
                charMap[charCodeData[0].trim().toLowerCase()] = charCodeData[nameIndex].split('#')[0].trim().toUpperCase();
            });

        mappingRequests[index].done = true;
        console.log(mappingRequests);
        if (mappingRequests.every(function (req) { console.log(req.done); return req.done; })) {
            console.log(charMap['1f9d6 1f3fe 200d 2640 fe0f']);
            loader.classList.add('hide');
            mainContent.classList.remove('hide');
            charInputElement.focus();
        }

    }

    // eslint-disable-next-line no-unused-vars
    // function createEmojiMapping () {
    //     if (this.readyState == 4 && this.status == 200) {
    //         this.responseText
    //             .split('\n')
    //             .forEach(function (charCodeItem) {
    //                 var charCodeData = charCodeItem.split(';');    
    //                 charMap[charCodeData[0].toLowerCase()] = charCodeData[2].toUpperCase();
    //             });
    //     }
    // load the emoji variation mapping
    // if char has 1 surrogate pair
    //      look in main mapping
    //  if char has 2 suroogate pairs and no ZWJ
    //      look in Emoji_Modifier_Sequence mapping
    // if char has >=2 SPs and SWJ
    //    look in ZWJ mapping
    // }

    /**
     * A zero-width joiner is used to combine two Unicode characters together to create a new emoji.
     *  https://unicode.org/Public/emoji/12.1/
     * @param {string} string 
     * @returns {boolean}
     */
    function hasZeroWidthJoiner (string) {
        return string.match(/\u200D/);
    }

    function trimStringToSingleDisplayCharacter (string) {
        // test - ㊗️ -- FE0F is some special modifier that goes after this
        // variation selector - https://codepoints.net/U+FE0F?lang=en
        // If that is a symbol, dingbat or emoji, U+FE0F forces it to be rendered as a colorful image as compared to a monochrome text variant. 
        console.log('orig string', string);
        // the surrogate pair range is used to encode characters of more than 2 bytes. Don't trim them.
        var numberOfSurrogatePairs = (string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
        console.log('surrogate pairs? ', numberOfSurrogatePairs);
        console.log('hasZeroWidthJoiner', hasZeroWidthJoiner(string));
        var trimmedString =  string.slice(0, 1 + (numberOfSurrogatePairs * 2));
        console.log(trimmedString);
        return trimmedString;
    }
    function handleInputData (event) {
        event.preventDefault();
        this.value = trimStringToSingleDisplayCharacter(this.value);
        setCharNameDisplay(this.value, this.value.codePointAt(0));
    }

    function setCharNameDisplay (char, charPoint) {
        charSymbolElement.innerText = char;
        charNameElement.innerText = charMap[getFourDigitHex(charPoint)] || SHRUG;
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
})();
