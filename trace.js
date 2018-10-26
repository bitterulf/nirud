const potrace = require('potrace');
const fs = require('fs');

potrace.trace('./icons.png', function(err, svg) {
  if (err) throw err;
  fs.writeFileSync('./output.svg', svg);
});
