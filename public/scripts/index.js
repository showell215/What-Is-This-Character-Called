(function () {

    var input = '',
        nonPrintable = ['9', 'd', '21', '22', '23', '24', '25', '26', '27', '28'];

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
        }
    }

    function isNonPrintableChar (string, code) {
        // eslint-disable-next-line no-control-regex
        return /[\x00-\x1F]/.test(string) || nonPrintable.indexOf(code.toString()) > -1;
    }
    function isMultiByteChar (string) {
        return /[\uD800-\uDFFF]/.test(string);
    }

    function handleInputData (event) {
        charInputElement.value = '';
        // pasted input is covered by the 'paste' event. Don't let input event duplicate it 
        if (event.inputType === 'insertFromPaste') {
            this.value = input || '';
            return;
        }

        input = event.clipboardData ? event.clipboardData.getData('Text') : event.key;

        if (input && typeof input === 'string' && input.length) {
            input = isMultiByteChar(input) ? input : input.substring(0, 1);
            charInputElement.value = input;
            setCharNameDisplay(input, input.codePointAt(0));
        }
    }

    function handleInputFocusChange (event) {
        event.target.value = '';
    }

    function handleKeyPress (event) {
    // eslint-disable-next-line no-console 
        if (isNonPrintableChar(event.key, event.keyCode)) {
            event.preventDefault();
            return;
        }

        if (document.activeElement !== charInputElement) {
            setCharNameDisplay(event.key, event.key.codePointAt(0));
        } else {
            handleInputData(event);
        }
    }

    function setCharNameDisplay (char, charPoint) {
        charSymbolElement.innerText = char;
        charNameElement.innerText = charMap[getFourDigitHex(charPoint)] || shrug;
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
        charInputElement.addEventListener('input', function (event) {
            event.preventDefault();
            this.value = isMultiByteChar(this.value) || this.value.length === 1 ? this.value.slice(this.value.length / 2) : this.value.slice(0, 1);
            return;
        });
        charInputElement.addEventListener('paste', handleInputData);
        charInputElement.addEventListener('focus', handleInputFocusChange);
        charInputElement.addEventListener('focusout', handleInputFocusChange);
        window.addEventListener('keypress', handleKeyPress);
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
