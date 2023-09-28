import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

const dbConfig = initializeApp({
  databaseURL:
    'https://pwa-simple-ig-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = getDatabase(dbConfig);
const postsRef = ref(db, '/posts');
const app = express();

app.use(json());
app.use(cors());

app.post('/', (req, res) => {
  try {
    push(postsRef, req.body);

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
