# PRHONE SCP
> Simple config parser.

[![Build Status](https://travis-ci.org/romelperez/prhone-scp.svg?branch=master)](https://travis-ci.org/romelperez/prhone-scp)

Parse simple config files to extract configurable information for your projects.

## Install

```bash
npm install prhone-scp
```

## Example

### __dirname + '/data/config.conf'

```
# Config file.
# Comments start with "#".

USER romel

PASS 123

NAMES
maria
john
karen

ADDRESS
Street 987 ave 456
```

### __dirname + '/app.js'

```js
var scp = require('prhone-scp');

// I recommend token names to be uppercase.
scp.config({
  //encoding: 'utf8',
  tokens: {
    USER: 'line',
    PASS: 'line',
    NAMES: 'multiline',
    ADDRESS: function (data) {
      data = data.toUpperCase();
      return data;
    }
  }
});

scp.parse(__dirname +'/data/config.conf', function (err, conf) {
  if (err) throw err;

  console.log(conf.USER);  // 'romel'
  console.log(conf.PASS);  // '123'
  console.log(conf.NAMES);  // ['natalia', 'john', 'karen']
  console.log(conf.ADDRESS);  // 'STREET 987 AVE 456'
});
```
## License

MIT
