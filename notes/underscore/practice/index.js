const _ = require('./practice');



let obj = {
	a: 12,
	b: 'asdf',
	c: '54'
}

_.each(obj, (v, k, o) => {
	console.log(v);
});