const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const app = express();
const PORT = process.env.PORT || 3000;

// This stores gift queues for every player in your game
let giftQueues = {}; 

app.get('/getGifts', (req, res) => {
    const username = req.query.user;
    if (!username) return res.status(400).send("No username provided");

    // If we aren't tracking this user yet, start a connection
    if (!giftQueues[username]) {
        giftQueues[username] = [];
        let tiktokConn = new WebcastPushConnection(username);

        tiktokConn.connect().then(state => {
            console.log(`Connected to ${username}`);
        }).catch(err => {
            console.error(`Failed to connect to ${username}`, err);
            delete giftQueues[username];
        });

        // When a gift is sent, push it to that user's specific queue
        tiktokConn.on('gift', data => {
            if (data.repeatEnd) { // This filters out "streak" spam and only takes the total
                giftQueues[username].push({
                    giftName: data.giftName,
                    amount: data.repeatCount
                });
            }
        });
    }

    // Send the gifts back to Roblox and clear the queue for that user
    let userGifts = [...giftQueues[username]];
    giftQueues[username] = []; 
    res.json(userGifts);
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
