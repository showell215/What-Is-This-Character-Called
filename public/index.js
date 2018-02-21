function createMapping () {
    if (this.readyState == 4 && this.status == 200) {
        http.responseText
            .split('\n')
            .forEach(function (charCodeItem) {
                var charCodeData = charCodeItem.split(';');    
                charMap[charCodeData[0].toLowerCase()] = charCodeData[1];
            });
            loader.classList.add('hide');
            mainContent.classList.remove('.hide');
    }
}

function handleKeyPress (event) {
    charSymbolElement.innerText = event.key;
    charNameElement.innerText = charMap[getFourDigitHex(event.charCode)] || shrug;
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
    window.addEventListener('keypress', handleKeyPress);
}

// init code that does not depened on elements
var charNameElement, charSymbolElement, loader, mainContent,
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