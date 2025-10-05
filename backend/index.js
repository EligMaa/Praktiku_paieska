const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(
    cors({
        origin: 'http://localhost:5173'
    })
);

app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});