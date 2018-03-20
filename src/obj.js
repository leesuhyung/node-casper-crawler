const axios = require('axios');
const debug = require('debug')('y-coin:obj');
const qs = require('querystring');
const users = require('./users');
const exec = require('child-process-promise').exec;

/**
 * 옐로코인 조회
 * @param obj
 */
const requestYcoin = (obj) => {
    const json = JSON.stringify({
        "email": obj.email,
        "password": obj.password,
        "startDate": obj.startDate,
        "endDate": obj.endDate
    });

    exec('./node_modules/casperjs/bin/casperjs ./src/coin.js --params=\'' + json + '\'')
        .then(function (result) {
            const stdout = JSON.parse(result.stdout);

            obj.status = stdout.status;
            obj.message = stdout.message;
            obj.total_count = stdout.total_count;
            obj.total_sum = stdout.total_sum;

            sendConfirmation(obj);
        })
        .catch(function (err) {
            obj.status = 500;
            obj.message = err;

            sendConfirmation(obj);
        });
};

/**
 * 슬랙 피드백 전송
 * @param obj
 */
const sendConfirmation = (obj) => {
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: obj.userId,
        text: '옐로코인 조회 결과 입니다!',
        attachments: JSON.stringify([
            {
                title: '옐로코인 바로가기',
                title_link: 'http://yellocoin.com',
                fields: [
                    {
                        title: '조회기간',
                        value: obj.startDate + ' ~ ' + obj.endDate,
                    },
                    {
                        title: '응답결과',
                        value: obj.message+'('+obj.status+')',
                    },
                    {
                        title: '구매(건)',
                        value: obj.total_count,
                        short: true,
                    },
                    {
                        title: '사용(코인)',
                        value: obj.total_sum,
                        short: true,
                    },
                ],
            },
        ]),
    })).then((result) => {
        debug('sendConfirmation: %o', result.data);
    }).catch((err) => {
        debug('sendConfirmation error: %o', err);
        console.error(err);
    });
};

const create = (userId, submission) => {
    const obj = {};

    const fetchUserEmail = new Promise((resolve, reject) => {
        users.find(userId).then((result) => {
            debug(`user: ${userId}`);
            resolve(result.data.user.profile.email);
        }).catch((err) => {
            reject(err);
        });
    });

    fetchUserEmail.then((result) => {
        obj.userId = userId;
        obj.userEmail = result;
        obj.email = submission.email;
        obj.password = submission.password;
        obj.startDate = submission.startDate;
        obj.endDate = submission.endDate;
        requestYcoin(obj);
        // sendConfirmation(obj);

        return obj;
    }).catch((err) => {
        console.error(err);
    });
};

module.exports = {create};
