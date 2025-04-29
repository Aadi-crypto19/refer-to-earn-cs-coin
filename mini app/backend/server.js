const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin SDK setup
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Create user
app.post('/create-user', async (req, res) => {
  try {
    const { username, referrer } = req.body;

    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    await userRef.set({
      username,
      referrer: referrer || null,
      score: 0,
      referrals: 0,
      createdAt: new Date().toISOString(),
    });

    // If there's a referrer, increase their referral count
    if (referrer) {
      const referrerRef = db.collection('users').doc(referrer);
      const referrerDoc = await referrerRef.get();

      if (referrerDoc.exists) {
        await referrerRef.update({
          referrals: admin.firestore.FieldValue.increment(1),
        });
      }
    }

    res.status(200).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users')
      .orderBy('referrals', 'desc')
      .limit(10)
      .get();

    const leaderboard = [];
    usersSnapshot.forEach(doc => leaderboard.push(doc.data()));

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Placeholder for future task tracking
app.post('/complete-task', async (req, res) => {
  const { username } = req.body;
  try {
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.update({
      score: admin.firestore.FieldValue.increment(10), // placeholder value
    });

    res.status(200).json({ message: 'Task completed!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
