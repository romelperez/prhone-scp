// prhone-scp test

var assert = require('assert');
var scp = require('../lib');

scp.config({
  tokens: {
    'DESTINATION': 'line',
    'ANIMALS': 'multiline',
    'ORIGIN': 'line',
    'MYSQL_BACKUP': function (data) {
      data = '<<'+ data +'>>';
      return data;
    },
    'SERVERS': 'multiline',
    'MONGODB_BACKUP': function (data) {
      data = data.toUpperCase();
      return data;
    },
    'ADD_FILES': 'multiline'
  }
});

var parse = function (path) {
  scp.parse(path, function (err, cf) {

    console.log('\nConfig file:', path);

    assert.ok(!err, err, 'Intern error.');

    assert.equal(cf.ORIGIN, 'this is the origin', 'ORIGIN was not read properly.');
    assert.equal(cf.DESTINATION, 'this is the destination', 'DESTINATION was not read properly.');
    assert.equal(cf.MYSQL_BACKUP, '<<true>>', 'MYSQL_BACKUP was not read properly.');
    assert.equal(cf.MONGODB_BACKUP, 'FALSE', 'MONGODB_BACKUP was not read properly.');
    assert.equal(cf.ANIMALS.length, 8, 'ANIMALS did not read all items properly.');
    assert.equal(cf.ANIMALS[3], 'cat', 'ANIMALS[3] was not read properly.');
    assert.equal(cf.SERVERS.length, 5, 'SERVERS did not read all items properly.');
    assert.equal(cf.SERVERS[2], 'three', 'SERVERS[2] was not read properly.');
    assert.equal(cf.ADD_FILES.length, 5, 'ADD_FILES did not read all items properly.');
    assert.equal(cf.ADD_FILES[2], '/folder1/folder2/file3.txt', 'ADD_FILES[2] was not read properly.');

    console.log('Everything ok!');
  });
};

parse(__dirname +'/files/neat.conf');
parse(__dirname +'/files/dirty-unix.conf');
parse(__dirname +'/files/dirty-mac.conf');
parse(__dirname +'/files/dirty-dos.conf');

console.log('Test starting...');
