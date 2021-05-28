const app = require('express')(),
  request = require('request'),
  server = require('http').Server(app),
  wss = require('ws'),
  cryptr = require('cryptr'),
  session = require('express-session')
require('ejs')

app.set('view engine', 'ejs')
app.use(require('body-parser').urlencoded({
  extended: false
}))
app.use(require('body-parser').json())
app.use(require('cors')())
app.use(session({ secret: process.env.key, resave: true, saveUninitialized: true }))

var serveur = "speakjs.herokuapp.com",
  makeid = function (length) {
    var r = []
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
      r.push(c.charAt(Math.floor(Math.random() * c.length)))
    }
    return r.join('')
  }
app.get('/', (req, res) => {
  if(!req.query.guild) req.session.guild = serveur
  if(req.query.guild !== null && req.query.guild.startsWith('http://' || 'https://' || 'ws://' || 'wss://')) {
    req.session.guild = req.query.guild.replace('http://' || 'https://' || 'ws://' || 'wss://', '')
    return res.status(203).json({ status: true, code: 203, message: req.session.guild })
  }
  /*
  if(!req.query.guild) { req.session.guild = serveur }
*/
  req.session.avatar = `https://api.multiavatar.com/${makeid(10)}.svg`
  var arr = [],
    users,
    msg
  request.get(`https://${serveur}/message`, (e, r) => {
    var b = JSON.parse(r.body)
    users = b.users
    msg = b.msg

    b.msg.forEach(a => {
      console.log(a)
      arr.push({
        username: a.username,
        content: new cryptr(String(a.expire)).decrypt(a.content),
        color: a.color,
        CreatedAt: a.CreatedAt,
        avatar: a.avatar || null,
        expire: a.expire
      })
    })
    res.render('main', {
      user: {
        avatar: req.session.avatar,
        guild: req.session.guild
      },
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
