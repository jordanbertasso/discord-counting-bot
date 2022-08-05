import express from 'express';
import morgan from 'morgan';

const app = express();
const port = 3000;

app.use(morgan('combined'));

app.get('/', async (req, res) => {
  res.send('Hello World!');
});

const startWebServer = () => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

export default startWebServer;
