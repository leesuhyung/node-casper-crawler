const casper = require('casper').create();
const params = JSON.parse(casper.cli.options.params);
const url = "http://yellocoin.com";
const obj = {};

function handler(status, message) {
    obj.status = status;
    obj.message = message;
    casper.echo(JSON.stringify(obj)).exit();
}

/**
 * 로그인
 */
casper.start().thenOpen(url + '/auth/ajax/doValidateUsers', {
    method: "post",
    data: {
        email: params.email,
        password: params.password
    },
    headers: {
        'Accept': 'application/json'
    }
}, function () {
    var data = JSON.parse(this.getPageContent().replace(/<\/?[^>]+(>|$)/g, ""));

    if (!data.result) {
        handler(401, data.msg);
    }
});

/**
 * 데이터 요청
 */
casper.then(function () {
    this.open(url + '/mypage/data/timelineListData', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        data: {
            'ptype': 2,
            'startDate': params.startDate,
            'endDate': params.endDate,
        }
    });

    this.then(function () {
        if (this.currentHTTPStatus === 200) {
            var data = JSON.parse(this.getPageContent().replace(/<\/?[^>]+(>|$)/g, ""));
            obj.total_count = data.total_count;
            obj.total_sum = data.total_sum;
        } else {
            handler(this.currentHTTPStatus, '옐로코인 데이터 요청 실패');
        }
    })
});

casper.run(function () {
    handler(this.currentHTTPStatus, '성공');
});

/*
casper.start(url + '/splash');

// 로그인 버튼 클릭
casper.then(function () {
    if (this.exists('#link_login')) {
        this.click('#link_login');
    }
});

// 로그인 시도
casper.then(function () {
    this.waitForSelector('#dlg_login', function () {
        this.evaluate(function (email, password) {
            document.querySelector('input[name=email]').value = email;
            document.querySelector('input[name=password]').value = password;
            document.querySelector('button[type=submit]').click();
        }, email, password);
    });
});

// 로그인 체크
casper.waitFor(function check() {
    var currentUrl = this.getCurrentUrl();
    this.echo(currentUrl);
    return (currentUrl.indexOf('mypage') > -1);
}, null, function timeout() {
    returnData.status = 401;
    returnData.message = '로그인 실패';
    this.echo(JSON.stringify(returnData));
    this.exit();
});
*/