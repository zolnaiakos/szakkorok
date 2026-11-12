import express from 'express'
import szakkorok from './routes/szakkorok.js'

const app = express();
const port = 3000;

app.use('/szakkorok', szakkorok)


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})