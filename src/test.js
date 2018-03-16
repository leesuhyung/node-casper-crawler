const casper = require('casper').create();
const fs = require('fs');

// URL
const url = "http://yellocoin.com/splash";
const email = "shlee1129@yellostory.co.kr";
const password = "new1526615!";
const returnData = {};

casper.start(url);

/**
 * 로그인 버튼 클릭
 */
casper.then(function () {
    if (this.exists('#link_login')) {
        this.click('#link_login');
    }
});

/**
 * 로그인 시도
 */
casper.then(function () {
    this.waitForSelector('#dlg_login', function () {
        this.evaluate(function (email, password) {
            document.querySelector('input[name=email]').value = email;
            document.querySelector('input[name=password]').value = password;
            document.querySelector('button[type=submit]').click();
        }, email, password);
    });
});

/**
 * 로그인 체크
 */
casper.waitFor(function check() {

    var currentUrl = this.getCurrentUrl();
    this.echo(currentUrl);
    return (currentUrl.indexOf('mypage') > -1);

}, function then() {
    returnData.response = 'success';
    returnData.message = '로그인에 성공했습니다.';
    // this.echo(JSON.stringify(phantom.cookies));

    // phantom.cookies.forEach(function (v) {
    //     console.log(v.name+":"+v.value);
    // });

    // TODO: http://yellocoin.com/mypage/data/timelineListData
    // TODO: ptype = 2, startDate = 2018-03-01, endDate = 2018-03-16
    // TODO: 보내고 리턴데이터 중 total_count, total_sum 만 가져온다.

}, function timeout() {
    returnData.response = 'failed';
    returnData.message = '로그인에 실패했습니다.';
    this.exit();
});

// TODO: 요걸로 해보기
/*casper.open('http://example.com/ajax.php', {
    method: 'POST',
    data: {
        'title': '<title>',
        'unique_id': '<unique_id>'
    }
}, function(response){
    if(response.status == 200){
        require('utils').dump(this.page.content);
    }
});*/

/**
 * 기간기정 라벨 클릭
 */
casper.then(function () {
    this.waitForSelector('form > dl > dt > span:nth-child(2) > i', function () {
        this.evaluate(function () {
            document.querySelector('form > dl > dt > span:nth-child(2) > i').click();
        });

        // e.g.
        // <button type="submit">But my button is sexier</button>
        // this.clickLabel('But my button is sexier', 'button');
    });
});

/**
 * 날짜 데이터 삽입 후 조회 버튼 클릭
 */
casper.then(function () {
    this.evaluate(function () {
        document.querySelector('input[name=startDate]').value = '2018-02-01';
        document.querySelector('input[name=endDate]').value = '2018-02-28';
        document.querySelector('input[class=btn_select]').click();
    });
});

/**
 * 조회된 총 건수, 금액 저장
 */
casper.then(function () {
    /*this.waitForSelector('form > dl > dt > dd[class=select_date]', function () {
        this.evaluate(function () {
            returnData.count = document.querySelector('form > dl > dt > dd[class=select_date] > strong:nth-child(1) > span').innerHTML;
            returnData.sum = document.querySelector('form > dl > dt > dd[class=select_date] > strong:nth-child(2) > span').innerHTML;
        });
    });*/
    /*this.evaluate(function () {
        this.echo(document.querySelector('form > dl > dt > dd[class=select_date] > strong:nth-child(1) > span').innerHTML);
        this.echo(document.querySelector('form > dl > dt > dd[class=select_date] > strong:nth-child(2) > span').innerHTML);
    });*/

    /*this.waitForSelector('form > dl > dt > dd[class=select_date]', function () {
        returnData.count = this.getElementInfo('form > dl > dt > dd[class=select_date] > strong:nth-child(1) > span').text;
        returnData.sum = this.getElementInfo('form > dl > dt > dd[class=select_date] > strong:nth-child(2) > span').text;
    });*/
});

/**
 * 캡쳐
 */
casper.then(function () {
    this.echo(JSON.stringify(returnData));
    this.echo("---------------------------");
    this.echo("5초후 캡쳐와 html을 생성합니다.");
    this.echo("---------------------------");
    /*this.wait(5000, function () {
        this.capture('capture.png');
        fs.write('capture.html', this.getHTML(), 'w')
    });*/
});

casper.run();