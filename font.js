const fs = require('fs');
const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync('./struktur.ttf');

const attributes = {
    fill: 'red',
    // stroke: 'black'
};
const options = {x: 0, y: 0, fontSize: 150, anchor: 'top', attributes: attributes};

const svg = textToSVG.getSVG('START the GAME! - Victory is near', options);
fs.writeFileSync('./outputText.svg', svg);
