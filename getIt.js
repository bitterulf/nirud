const unirest = require('unirest');
const fs = require('fs');

unirest.get('https://www.flickr.com/photos/britishlibrary/page1/')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .end(function (response) {
        const ids = response.body.split(/\r?\n/)
            .filter(function(line) {
                return line.indexOf('.staticflickr.com') > -1 && line.indexOf('img.src=') > -1
            })
            .map(function(line) {
                return line.split('.com')[1].split('/')[3].split('_')[0];
            });

        fs.writeFileSync('./response.json', JSON.stringify({ ids: ids }));
        console.log(ids.length);
    });
