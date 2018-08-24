var Xray = require('x-ray');
var x = Xray();

x('https://www.flickr.com/photos/britishlibrary/11220569733', '.photo-list-photo-interaction', [{
    text: 'a',
    link: 'a@href'
}])
    // .paginate('a[rel="next"]@href')
    // .limit(3)
    .write('results.json')
