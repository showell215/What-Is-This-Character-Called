var input = '';

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

function isMultiByteChar (string) {
    return /[\uD800-\uDFFF]/.test(string);
}

function handleInputData (event) {
    // pasted input is coverd by the 'paste' event. Don't let input event duplicate it 
    if (event.inputType === 'insertFromPaste') {
        this.value = input || '';
        return;
    }

    input = event.clipboardData ? event.clipboardData.getData('Text') : event.data;

    if (input && typeof input === 'string' && input.length) {
        input = this.value = isMultiByteChar(input) ? input : input.substring(0, 1);
        setCharNameDisplay(input, input.codePointAt(0));
    }
}

function handleInputFocusChange (event) {
    event.target.value = '';
}

function handleKeyPress (event) {
    if (document.activeElement !== charInputElement) {
        setCharNameDisplay(event.key, event.key.codePointAt(0));
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
    charInputElement.addEventListener('input', handleInputData);
    charInputElement.addEventListener('paste', handleInputData);
    charInputElement.addEventListener('focus', handleInputFocusChange);
    charInputElement.addEventListener('focusout', handleInputFocusChange);
    window.addEventListener('keypress', handleKeyPress);
}

// init code that does not depened on elements
var charNameElement, charSymbolElement, loader, mainContent, charInputElement,
    shrug = '¯\\_(ツ)_/¯',
    charMap = {},
    http = new XMLHttpRequest();

http.onreadystatechange = createMapping;
http.open('GET', '/ucd/');
http.send();

// init page, or wait for DOMContentLoaded to init page
if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}