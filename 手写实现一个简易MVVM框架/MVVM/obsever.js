class Observer {
    constructor(data) {
        this.observe(data);
    }

    observe(data) {
            //将数据data原因的属性改成get、set形式
            if (!data | typeof data !== 'object') {
                return;
            }
            //要将数据 一一劫持 先获取到对象的key和value
            Object.keys(data).forEach(key => {
                //劫持
                this.defineReactive(data, key, data[key]);
                this.observe(data[key]); //递归深度劫持
            })
        }
        //定义响应式
    defineReactive(obj, key, value) {
        let that = this;
        let dep = new Dep(); //每个数据的变化 都会对应一个数组  这个数组是存放所有更新的操作
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() { //当取值时调用的方法
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set(newValue) { //当给data属性中设置值的时候 更改获取的属性值
                if (value != newValue) {
                    that.observe(newValue); //如果是对象 继续劫持
                    value = newValue;
                    dep.notify(); //通知所有人 数据更新了
                }
            }
        })
    }

}

class Dep {
    constructor() {
        // 订阅的数组
        this.subs = [];
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}
