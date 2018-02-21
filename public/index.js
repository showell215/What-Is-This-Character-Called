function createMapping () {
    if (this.readyState == 4 && this.status == 200) {
        http.responseText
            .split('\n')
            .forEach(function (charCodeItem) {
                var charCodeData = charCodeItem.split(';');    
                charMap[charCodeData[0].toLowerCase()] = charCodeData[1];
            });
            loader.innerText = 'DONE!!';
    }
}

function handleKeyPress (event) {
    charSymbolElement.innerText = event.key;
    charNameElement.innerText = charMap[getFourDigitHex(event.charCode)] || shrug;
}

function getFourDigitHex (num) {
    return ('0000' + (+num).toString(16)).substr(-4);
}

var charNameElement, charSymbolElement, loader,
    shrug = '¯\\_(ツ)_/¯',
    charMap = {},
    http = new XMLHttpRequest();

http.onreadystatechange = createMapping;
http.open('GET', '/ucd/UnicodeData.txt');
http.send();

document.addEventListener('DOMContentLoaded', function () {
    charNameElement = document.querySelector('.char-name');
    charSymbolElement = document.querySelector('.char-symbol');
    loader = document.querySelector('.loader');
    window.addEventListener('keypress', handleKeyPress);
});