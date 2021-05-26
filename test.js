const request = require('request')


request.get('http://localhost:3000/decrypte', {
    headers : {
        "content-type": "application/json",
    },
    body: {
        chaine: 'cee2a754ede55bd2255e94907f392686b937e1781940209feffb594412c45e8b419f1b72356020a94ca5216cae5dd17e1ee0bc4641ea45d1557816b3b0c845b5ac984379b3a4d4450ff13a297aeb847164b10867e0f81d6d25086fc5d2abc148ea85d4',
        key: "just a key"
    },
    json: true
}, function(err, res){
    if(err) throw err
    console.log(res.body)
})