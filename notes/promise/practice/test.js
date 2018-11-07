const Promise = require('../appoint.note')
let p = new Promise(function (resolve, reject) {
    setTimeout(function(){
        resolve('success')
    }, 1000)
    reject('fail');
})

p.then(ret => {
    console.log('resolve:' + ret)

}).catch(err => {
    console.log('reject: ' + err)
})