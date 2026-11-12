import express from 'express'
import szakkorok from './routes/szakkorok.js'
import diakok from './routes/diakok.js'
import utkozesek from './routes/utkozesek.js'
import jelentkezesek from './routes/jelentkezesek.js'

const app = express();
const port = 3000;

app.use(express.json())

app.use('/szakkorok', szakkorok)
app.use('/diakok', diakok)
app.use('/utkozesek', utkozesek)
app.use('/jelentkezesek', jelentkezesek)


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})