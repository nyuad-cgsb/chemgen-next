import agenda = require('../agenda/agenda');

agenda.define('testJob', function(job) {
  console.log('There is a testJob ' + JSON.stringify(job.attr.data, null, 2));
});

agenda.on('start', function(job) {
  console.log('Job %s starting', job.attrs.name);
  console.log(JSON.stringify(job.attrs.data));
});

agenda.on('ready', function() {
  console.log('Ready!');
  agenda.processEvery('2 seconds');
  agenda.maxConcurrency(5);
  agenda.defaultConcurrency(1);
  agenda.start();
  agenda.now('testJob', {hello: 'world', thing1: function hello(){console.log('hello!!')}});
  console.log('agenda has started...');
});
