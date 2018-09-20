const fs = require('fs');
const svg2png = require('svg2png');

const svg = fs.readFileSync('./combine.svg').toString();

svg2png(svg.replace('base.png', 'base2.png'))
    .then(function(result) {
        fs.writeFileSync('./base1.png', result);
    });
