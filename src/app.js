import express from 'express';
import cookieParser from 'cookie-parser';
import usersRouter from './routes/users.router.js';
import characterRouter from './routes/character.router.js'
import itemsRouter from './routes/items.router.js';

const app = express();
const PORT = 3080;

app.use(express.json());
app.use(cookieParser());
app.use('/api',[characterRouter])
app.use('/api',[usersRouter]);
app.use('/api',[itemsRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});