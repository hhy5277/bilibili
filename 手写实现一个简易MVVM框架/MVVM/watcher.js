//观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行相应的方法
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //先获取一下老的值
        this.value = this.get();
    }

    // methods
    getVal(vm, expr) { //获取实例上的数据
        expr = expr.split('.'); //a.b.c 	['a','b','c']

        return expr.reduce((prev, next) => { //vm.$data.a
            return prev[next];
        }, vm.$data);
    }
    get() {
            Dep.target = this;
            let value = this.getVal(this.vm, this.expr);
            Dep.target = null;
            return value;
        }
        //对外暴露的方法
    update() {
        let newValue = this.getVal(this.vm, this.expr);
        let oldValue = this.value;
        if (newValue != oldValue) {
            this.cb(newValue); //调用watch的callback
        }
    }
}

//用新值和老值进行对比 如果发生变化 就调用更新方法
