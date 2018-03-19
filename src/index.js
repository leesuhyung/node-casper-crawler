require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const ticket = require('./ticket');
const debug = require('debug')('slash-command-template:index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
        ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/commands', (req, res) => {
    // and trigger ID from payload
    const {token, trigger_id} = req.body;

    res.send(process.env.SLACK_ACCESS_TOKEN);

});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Helpdesk ticket
 */
app.post('/interactive-component', (req, res) => {
    const body = JSON.parse(req.body.payload);

    // check that the verification token matches expected value
    if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
        debug(`Form submission received: ${body.submission.trigger_id}`);

        // immediately respond with a empty 200 response to let
        // Slack know the command was received
        res.send('');

        // create Helpdesk ticket
        ticket.create(body.user.id, body.submission);
    } else {
        debug('Token mismatch');
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`);
});
