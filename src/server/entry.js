import express from 'express'
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', true)

app.use(express.static('./dist/public'))

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile('index.html', { root: './dist/public' }, e => e && next())
  } else next()
})

app.listen(process.env.PORT || 3000, process.env.HOST, function () {
  console.log(`************************************************************
Listening at http://${this.address().address}:${this.address().port}
NODE_ENV: ${process.env.NODE_ENV}
process.pid: ${process.pid}
root: ${require('path').resolve()}
************************************************************`)
})

export default app