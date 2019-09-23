//脏值检测 你要先保留一个原有的值 有一个新值
//上个例子是不停的监控新放的值  $watch $apply  angular.js更新的方式是手动更新，angularjs有个scope的概念
//ViewModel

function Scope(argument) {
    this.$$watchers = [];
}

Scope.prototype.$digest = function() { //负责检查 至少检查一次
    var dirty = true;
    var count = 9;
    do {
        dirty = this.$digestOne();
        if (count == 0) { //已经查了10次
            throw new Error('$digest 10 iterations reached, Aborting!')
        }
    } while (dirty && count--);
}

Scope.prototype.$digestOne = function() { //检查一次
    let dirty = false;
    this.$$watchers.forEach(watcher => {
        let oldVal = watcher.last; //老值
        let newVal = this[watcher.exp];
        if (newVal != oldVal) { //更新了
            watcher.fn(newVal, oldVal); //调用了fn可能就会更改数据，更改数据就应该再查一遍
            dirty = true;
            watcher.last = newVal; //更新老值
        }
    })
    return dirty;
}

Scope.prototype.$watch = function(exp, fn) {
    //$watch中应该保留的内容有函数， 还有 当前的老值，保留一个表达式
    this.$$watchers.push({
        fn,
        last: this[exp],
            exp
    })
}

Scope.prototype.$apply = function() {
    this.$digest();
    // this.$$watchers.forEach(watcher=>{
    // 	let oldVal = watcher.last;//老值
    // 	let newVal = this[watcher.exp];
    // 	if(newVal != oldVal){//更新了
    // 		watcher.fn(newVal,oldVal);
    // 		watcher.last = newVal;//更新老值
    // 	}
    // })
}


// Vue Object.defineProperty  proxy + reflect 代理，改写原生的set方法

let scope = new Scope();
scope.name = "hhy";
scope.age = 9;
scope.$watch('name', function(newValue, oldValue) {
    scope.name = Math.random();
})

scope.$watch('age', function(newValue, oldValue) {
        scope.name = "hhy222";
    })
    // scope.name = "hhy2";
scope.age = 10;
scope.$apply(); //触发$watch
