const exec = require('child-process-promise').exec;

var json = JSON.stringify({
    "email": "you@email.com",
    "password": "password",
    "startDate": "2018-02-01",
    "endDate": "2018-02-28"
});

exec('node_modules/casperjs/bin/casperjs src/coin.js --params=\''+json+'\'')
    .then(function (result) {
        var stdout = JSON.parse(result.stdout)
        console.log(stdout.total_count);
    })
    .catch(function (err) {
        console.error(err);
    });