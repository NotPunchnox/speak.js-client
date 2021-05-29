const app = require('express')(),
  request = require('request'),
  server = require('http').Server(app),
  wss = require('ws'),
  cryptr = require('cryptr'),
  session = require('express-session')
require('ejs')

app.set('view engine', 'ejs')
app.use(require('body-parser').urlencoded({extended: false}))
app.use(require('body-parser').json())
app.use(require('cors')())
app.use(require('express').static(__dirname + '/public'));
process.env.key = 'hey'
app.use(session({ secret: process.env.key, resave: true, saveUninitialized: true }))

var serveur = "speakjs.herokuapp.com"

app.get('/', (req, res) => {
  if(!req.query.guild) {req.session.guild = serveur}
  if(req.query.guild !== undefined && req.query.guild.startsWith('http://' || 'https://' || 'ws://' || 'wss://')) {
    req.session.guild = req.query.guild.replace('http://' || 'https://' || 'ws://' || 'wss://', '')
    return res.status(203).json({ status: true, code: 203, message: req.session.guild })
  }
  if(req.query.guild) {
    req.session.guild = req.query.guild
  }
  req.session.username = req.query.username || 'nothing'
  req.session.avatar = `https://api.multiavatar.com/${req.session.username}.svg`
  var arr = [],
    users,
    msg
    console.log(req.session.guild)
  request.get(`https://${req.session.guild}/message`, (e, r) => {
    if(e) return res.status(503).json({status: false, code: 503, error: e})
    if(r.statusCode !== 203) return res.status(503).json({ status: false, code: 503, 'code-request': r.statusCode })
    console.log(r)
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
        username: req.session.username,
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

app.get('/test', (req, res)=> {
  res.render('test')
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
