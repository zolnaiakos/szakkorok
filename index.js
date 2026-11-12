import express from 'express'
import szakkorok from './routes/szakkorok.js'
import diakok from './routes/diakok.js'

const app = express();
const port = 3000;

app.use('/szakkorok', szakkorok)
app.use('/diakok', diakok)


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})