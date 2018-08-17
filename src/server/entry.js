import 'source-map-support/register'
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import apolloServer from './graphql'

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', true)

if (process.env.NODE_ENV === 'production') app.use(helmet())

app.use(express.static('./dist/public'))

apolloServer.applyMiddleware({ app })

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile('index.html', { root: './dist/public' }, e => e && next())
  } else next()
})

app.listen(process.env.PORT || 3000, process.env.HOST, function () {
  console.log(`************************************************************
Express app listening at http://${this.address().address}:${this.address().port}
NODE_ENV: ${process.env.NODE_ENV}
process.pid: ${process.pid}
root: ${require('path').resolve()}
************************************************************`)
})

export default app
