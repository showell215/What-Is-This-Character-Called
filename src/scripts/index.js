(function () {
    // convert raw unicode data to a mapping by character code
    function createMapping () {
        if (this.readyState == 4 && this.status == 200) {
            http.responseText
                .split('\n')
                .forEach(function (charCodeItem) {
                    var charCodeData = charCodeItem.split(';');    
                    charMap[charCodeData[0].toLowerCase()] = charCodeData[1];
                });

            loader.classList.add('hide');
            mainContent.classList.remove('hide');
            charInputElement.focus();
        }
    }

    function trimStringToSingleCharacter (string) {
        // the surrogate pair range is used to encode characters of more than 2 bytes. Don't trim them.
        var numberOfSurrogatePairs = (string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;

        return string.slice(0, 1 + (numberOfSurrogatePairs * 2));
    }
    function handleInputData (event) {
        event.preventDefault();
        this.value = trimStringToSingleCharacter(this.value);
        setCharNameDisplay(this.value, this.value.codePointAt(0));
    }

    function setCharNameDisplay (char, charPoint) {
        charSymbolElement.innerText = char;
        charNameElement.innerText = charMap[getFourDigitHex(charPoint)] || shrug;
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

    // init code that does not depend on elements
    var charNameElement, charSymbolElement, loader, mainContent, charInputElement,
        shrug = '¯\\_(ツ)_/¯',
        charMap = {},
        http = new XMLHttpRequest();

    http.onreadystatechange = createMapping;
    http.open('GET', '/ucd/UnicodeData.txt');
    http.send();

    // init page, or wait for DOMContentLoaded to init page
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
