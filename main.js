const app = require('express')(),
  request = require('request')
server = require('http').Server(app),
  wss = require('ws'),
  cryptr = require('cryptr')
require('ejs')

app.set('view engine', 'ejs')
app.use(require('body-parser').urlencoded({
  extended: false
}))
app.use(require('body-parser').json())

var serveur = "speakjs.herokuapp.com"

app.get('/', (req, res) => {
  var arr = [],
    users,
    msg
  request.get(`https://${serveur}/message`, (e, r) => {
    var b = JSON.parse(r.body)
    users = b.users
    msg = b.msg

      b.msg.forEach(a => {
        arr.push({
          username: a.username,
          content: new cryptr(String(a.expire)).decrypt(a.content),
          color: a.color,
          CreatedAt: a.CreatedAt,
          expire: a.expire
        })
      })
    res.render('main', {
      data: {
        msg: JSON.stringify(arr),
        users: users,
        number: msg
      }
    })
  })
})

app.post('/crypte', (req, res) => {
  if (!req.body || !req.body.chaine && !req.body.key) return res.status(403).json({
    code: 403,
    missing: !req.body ? "body" : !req.body.chaine ? "chaine" : req.body.key ? "key" : "?"
  })
  res.status(200).json({
    code: 203,
    content: new cryptr(String(req.body.key)).encrypt(req.body.chaine),
    chaine: req.body.chaine,
    key: req.body.key
  })
})
app.post('/decrypte', (req, res) => {
  if (!req.body || !req.body.chaine && !req.body.key) return res.status(403).json({
    code: 403,
    missing: !req.body ? "body" : !req.body.chaine ? "chaine" : req.body.key ? "key" : "?"
  })
  res.status(203).json({
    code: 203,
    content: new cryptr(String(req.body.key)).decrypt(req.body.chaine),
    chaine: req.body.chaine,
    key: req.body.key
  })
})



var ws = new wss("ws://" + serveur)
ws.on('message', m => console.log(m))

server.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port: ${process.env.PORT || 3000}`);
})
