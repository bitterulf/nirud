const Canvas = require('canvas-prebuilt');
const fs = require('fs');

const fadeBar = function(ctx, x1, y1, x2, y2, reverse) {
    const t = 64;

    for (let i = 0; i <= t; i++) {
        ctx.strokeStyle = 'rgba(0,180,180,' + ( 1 / t * i) + ')';
        ctx.beginPath();
        if (reverse) {
            ctx.lineTo(x1, y1 - (t - i));
            ctx.lineTo(x2, y2 - (t - i));
        }
        else {
            ctx.lineTo(x1, y1 + (t - i));
            ctx.lineTo(x2, y2 + (t - i));
        }
        ctx.stroke();
    }
}

const generateCard = function(title) {
    const canvas = new Canvas(256, 256);
    const ctx = canvas.getContext('2d');

    const size = 20;
    ctx.font = size+'px Impact';
    ctx.fillText(title, size / 2, 256 - size / 2);

    const te = ctx.measureText(title);

    console.log(te);

    fadeBar(ctx, te.width + size, 256 - size / 2, 256 - size / 2, 256 - size / 2, true);

    fadeBar(ctx, te.width + size, size / 2, 256 - size / 2, size / 2);

    return canvas.toBuffer();
}

fs.writeFileSync('./temp/card1.png', generateCard('card1'));
