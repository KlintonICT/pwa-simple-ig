import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import webpush from 'web-push';

const dbConfig = initializeApp({
  databaseURL:
    'https://pwa-simple-ig-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = getDatabase(dbConfig);
const postsRef = ref(db, '/posts');
const subscriptionsRef = ref(db, '/subscription');
const app = express();

app.use(json());
app.use(cors());

app.post('/', async (req, res) => {
  try {
    await push(postsRef, req.body);
    webpush.setVapidDetails(
      'mailto:test@example.com',
      'BHlJzj2gec6Q_KrnyiBzXj9fdRNP96EsTSMakws_NoOOEHWEHIaskjBbLkQ68O4RV7NZV9Nj_PHfuMtgu7WHdB0',
      'LJkplu9ygEEfBAIiJ9hp_DqewbWzwSZKXQIkKeFelbI'
    );

    onValue(subscriptionsRef, (snapshot) => {
      const subs = snapshot;
      subs.forEach((sub) => {
        const pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh,
          },
        };

        webpush
          .sendNotification(
            pushConfig,
            JSON.stringify({
              title: 'New Post',
              content: 'New Post added',
              openUrl: '/help',
            })
          )
          .catch((err) => {
            console.log(err);
          });
      });
    });
    res.status(201).send({ message: 'Data stored', id: req.body.id });
  } catch (err) {
    res.status(500).send({ err });
  }
});

app.get('/', (req, res) => {
  onValue(postsRef, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
  });

  res.send('data');
});

app.listen(4000, () => {
  console.log('Listening on 4000');
});
