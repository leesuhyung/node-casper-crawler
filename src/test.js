const {exec} = require('child_process');

var json = JSON.stringify({
    "email": "shlee1129@yellostory.co.kr",
    "password": "new1526615!",
    "startDate": "2018-02-01",
    "endDate": "2018-02-28"
});

exec('node_modules/casperjs/bin/casperjs src/coin.js --params=\''+json+'\'', (err, stdout) => {
    if (err) {
        console.error(err);
        return;
    }

    var returnData = JSON.parse(stdout);

    console.log(returnData.total_count);
});