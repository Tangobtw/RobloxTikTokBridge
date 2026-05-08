const { WebcastPushConnection } = require('tiktok-live-connector');
const express = require('express');
const app = express();
app.use(express.json());

let activeStreamers = {}; 

app.post('/connect', (req, res) => {
    const { username } = req.body;
    if (!activeStreamers[username]) {
        let conn = new WebcastPushConnection(username);
        activeStreamers[username] = { gifts: [], connection: conn };
        conn.connect().then(() => console.log(`Connected to ${username}`)).catch(() => {});
        conn.on('gift', data => {
            activeStreamers[username].gifts.push(data.giftName);
        });
    }
    res.json({ success: true });
});

app.get('/getGifts/:username', (req, res) => {
    const user = req.params.username;
    if (activeStreamers[user]) {
        let gifts = activeStreamers[user].gifts;
        activeStreamers[user].gifts = []; 
        res.json({ gifts: gifts });
    } else { res.json({ gifts: [] }); }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
