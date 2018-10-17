const fs = require('fs');
const _ = require('lodash');
const parseString = require('xml2js').parseString;
const xml2js = require('xml2js');
const xml = fs.readFileSync('./base.svg');

parseString(xml, function (err, result) {
    const oldStyle = _.get(result, 'svg.g[0].path[2].$.style');
    _.set(result, 'svg.g[0].path[2].$.style', oldStyle.replace('fill-opacity:1;', 'fill-opacity:0;'));
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(result);
    fs.writeFileSync('./baseChanged.svg', xml);
});
