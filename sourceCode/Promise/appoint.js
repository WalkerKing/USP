// 这是promise的一种实现，源码仓库在  https://github.com/nswbmw/appoint

// 声明一个空函数
function INTERNAL() { }

function isFunction(func) {
    return typeof func === 'function'
}
function isObject(obj) {
    return typeof obj === 'object'
}
function isArray(arr) {
    return Array.isArray(arr)
}

// 定义promise的三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

module.exports = Promise

function Promise(resolver) {
    if (!isFunction(resolver)) {
        throw new TypeError('resolver must be a function')
    }
    this.state = PENDING
    this.value = void 0
    this.queue = []
    // 调用then方法创建一个子promise，此时不执行safelyResolveThen
    if (resolver !== INTERNAL) {
        safelyResolveThen(this, resolver)
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    if ((!isFunction(onFulfilled) && this.state === FULFILLED) ||
        (!isFunction(onRejected) && this.state === REJECTED)) {
        return this
    }
    const promise = new this.constructor(INTERNAL)
    if (this.state !== PENDING) {
        const resolver = this.state === FULFILLED ? onFulfilled : onRejected
        unwrap(promise, resolver, this.value)
    } else {
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected))
    }
    return promise
}

Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
}

function QueueItem(promise, onFulfilled, onRejected) {
    this.promise = promise
    this.callFulfilled = function (value) {
        doResolve(this.promise, value)
    }
    this.callRejected = function (error) {
        doReject(this.promise, error)
    }
    if (isFunction(onFulfilled)) {
        this.callFulfilled = function (value) {
            unwrap(this.promise, onFulfilled, value)
        }
    }
    if (isFunction(onRejected)) {
        this.callRejected = function (error) {
            unwrap(this.promise, onRejected, error)
        }
    }
}

function unwrap(promise, func, value) {
    process.nextTick(function () {
        let returnValue
        try {
            returnValue = func(value)
        } catch (error) {
            return doReject(promise, error)
        }
        if (returnValue === promise) {
            doReject(promise, new TypeError('Cannot resolve promise with itself'))
        } else {
            doResolve(promise, returnValue)
        }
    })
}

// self，priomise实例，value，异步返回值
function doResolve(self, value) {
    try {
        const then = getThen(value)
        if (then) {
            safelyResolveThen(self, then)
        } else {
            self.state = FULFILLED
            self.value = value
            self.queue.forEach(function (queueItem) {
                queueItem.callFulfilled(value)
            })
        }
        return self
    } catch (error) {
        return doReject(self, error)
    }
}

function doReject(self, error) {
    self.state = REJECTED
    self.value = error
    self.queue.forEach(function (queueItem) {
        queueItem.callRejected(error)
    })
    return self
}

// promise 第一个then，传入一个异步返回值
function getThen(promise) {
    const then = promise && promise.then
    if (promise && (isObject(promise) || isFunction(promise)) && isFunction(then)) {
        return function applyThen() {
            then.apply(promise, arguments)
        }
    }
}

// 安全执行then
// self，priomise实例，then，创建promise实例时传入的回调
function safelyResolveThen(self, then) {
    let called = false
    try {
        then(function (value) {
            if (called) {
                return
            }
            called = true
            doResolve(self, value)
        }, function (error) {
            if (called) {
                return
            }
            called = true
            doReject(self, error)
        })
    } catch (error) {
        if (called) {
            return
        }
        called = true
        doReject(self, error)
    }
}

let p = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve(123);
    }, 1000);
    resolve(234);
})
let p1 = p.then(data => {
    console.log(data);
    return data;
});
p1.catch(err => {
    console.error(err);
    return err;
}).then(data => {
    console.log(data);
})