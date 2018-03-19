const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');
const exec = require('child-process-promise').exec;

const requestYcoin = (ticket) => {
    var json = JSON.stringify({
        "email": ticket.email,
        "password": ticket.password,
        "startDate": ticket.startDate,
        "endDate": ticket.endDate
    });

    exec('node_modules/casperjs/bin/casperjs src/coin.js --params=\'' + json + '\'')
        .then(function (result) {
            var stdout = JSON.parse(result.stdout);

            ticket.status = stdout.status;
            ticket.message = stdout.message;
            ticket.total_count = stdout.total_count;
            ticket.total_sum = stdout.total_sum;

            sendConfirmation(ticket);
        })
        .catch(function (err) {
            ticket.status = 500;
            ticket.message = err;

            sendConfirmation(ticket);
        });
};

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: ticket.userId,
        text: '옐로코인 조회 결과 입니다!',
        attachments: JSON.stringify([
            {
                title: '옐로코인 바로가기',
                title_link: 'http://yellocoin.com',
                fields: [
                    {
                        title: '조회기간',
                        value: ticket.startDate + '~' + ticket.endDate,
                    },
                    {
                        title: '결과',
                        value: ticket.status + ':' + ticket.message,
                    },
                    {
                        title: '결과',
                        value: ticket.total_count + ':' + ticket.total_sum,
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

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
    const ticket = {};

    const fetchUserEmail = new Promise((resolve, reject) => {
        users.find(userId).then((result) => {
            debug(`Find user: ${userId}`);
            resolve(result.data.user.profile.email);
        }).catch((err) => {
            reject(err);
        });
    });

    fetchUserEmail.then((result) => {
        ticket.userId = userId;
        ticket.userEmail = result;
        ticket.email = submission.email;
        ticket.password = submission.password;
        ticket.startDate = submission.startDate;
        ticket.endDate = submission.endDate;
        requestYcoin(ticket);
        // sendConfirmation(ticket);

        return ticket;
    }).catch((err) => {
        console.error(err);
    });
};

module.exports = {create, sendConfirmation};
