let _ = function(){};

_.each = function(obj, iterate, context){
	for(var k in obj){
		iterate.call(context, obj[k], k, obj);
	}
	return obj;
}

module.exports = _;