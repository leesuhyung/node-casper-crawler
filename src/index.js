require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const obj = require('./obj');
const debug = require('debug')('y-coin:index');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('사용안내는 슬랙에서 /ycoin');
});

/**
 * 슬랙 커맨드 명령어로 dialog open.
 * submit 은 슬랙에서 이루어짐.
 */
app.post('/commands', (req, res) => {
    const {token, trigger_id} = req.body;

    // 슬랙 커맨드 도구에 저장한 토큰과 일치하는지 비교
    if (token === process.env.SLACK_VERIFICATION_TOKEN) {

        // 토큰이 포함된 dialog payload 생성
        const dialog = {
            token: process.env.SLACK_ACCESS_TOKEN,
            trigger_id,
            dialog: JSON.stringify({
                title: '옐로코인 조회',
                callback_id: 'submit-obj',
                submit_label: 'Submit',
                elements: [
                    {
                        label: 'Email',
                        type: 'text',
                        name: 'email',
                        subtype: 'email',
                        placeholder: 'you@yellostory.co.kr',
                        hint: '옐로스토리 이메일을 입력하세요.',
                    },
                    {
                        label: 'Password',
                        type: 'text',
                        name: 'password',
                        hint: '옐로스토리 비밀번호를 입력하세요.',
                    },
                    {
                        label: 'StartDate',
                        type: 'text',
                        name: 'startDate',
                        placeholder: '예)2018-01-01',
                        hint: '옐로코인 조회기간(시작)',
                    },
                    {
                        label: 'EndDate',
                        type: 'text',
                        name: 'endDate',
                        placeholder: '예)2018-01-01',
                        hint: '옐로코인 조회기간(끝)',
                    },
                ],
            }),
        };

        // 생성한 payload 로 dialog 오픈
        axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
            .then((result) => {
                debug('dialog.open: %o', result.data);
                res.send('');
            }).catch((err) => {
            debug('dialog.open error: %o', err);
            res.sendStatus(500);
        });
    } else {
        debug('SLACK_VERIFICATION_TOKEN 불일치');
        res.sendStatus(500);
    }
});

/**
 * 슬랙에서 dialog 가 submit 되면 자동으로 호출되는 곳
 */
app.post('/interactive-component', (req, res) => {
    const body = JSON.parse(req.body.payload);

    if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
        debug(`trigger_id: ${body.submission.trigger_id}`);

        // 공백 200 응답을 우선 슬랙에 전달 (해당 호출은 5초 이내 슬랙에 응답해야 함. or die)
        res.send('');

        // create obj
        obj.create(body.user.id, body.submission);
    } else {
        debug('SLACK_VERIFICATION_TOKEN 불일치');
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`app running. port: ${process.env.PORT}`);
});
