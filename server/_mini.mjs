import express from 'express'
const app = express()
app.get('/api/health', (_req,res)=>res.json({ok:true}))
app.listen(8799, '127.0.0.1', function(){ console.log('MINI listening on 8799') })
