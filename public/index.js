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

function handleInputData (event) {
    var char = event.data || this.value;
    console.log(event);
    console.log(this.value);
    if (char) {
        this.value = char;
        setCharNameDisplay(char, char.charCodeAt(0));
        this.value = '';
    }
}

function handleInputFocusChange (event) {
    inputFocused = !inputFocused;
    event.target.value = '';
}
// 
// function handleInputFocusOut (event) {
//     inputFocused = false;
//     event.target.value = '';
// }

function handleKeyPress (event) {
    if (!inputFocused) {
        setCharNameDisplay(event.key, event.charCode);
    }
}

function setCharNameDisplay (char, charCode) {
    charSymbolElement.innerText = char;
    charNameElement.innerText = charMap[getFourDigitHex(charCode)] || shrug;
}

function getFourDigitHex (num) {
    return ('0000' + (+num).toString(16)).substr(-4);
}

// init code that depends on elements
function init () {
    charNameElement = document.querySelector('.char-name');
    charSymbolElement = document.querySelector('.char-symbol');
    loader = document.querySelector('.loader');
    mainContent = document.querySelector('.main-content');
    charInputElement = document.querySelector('#char-input');
    charInputElement.addEventListener('input', handleInputData);
    charInputElement.addEventListener('focus', handleInputFocusChange);
    charInputElement.addEventListener('focusout', handleInputFocusChange);
    window.addEventListener('keypress', handleKeyPress);
}

// init code that does not depened on elements
var charNameElement, charSymbolElement, loader, mainContent, charInputElement,
    inputFocused = false,
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