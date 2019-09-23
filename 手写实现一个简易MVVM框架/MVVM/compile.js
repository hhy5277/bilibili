class Compile {
    constructor(el, vm) {

        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        if (this.el) {
            //如果能获取到元素 才开始编译
            //1.先把真实的DOM移入到内存中 fragment
            let fragment = this.node2fragment(this.el);
            // 2.编译 =》提取需要的元素节点 v-model 和文本节点 {{}}
            this.compile(fragment);
            //3.把编译好的fragment 塞回到页面里去
            this.el.appendChild(fragment);
        }
    }

    // 专门写一些辅助的methods
    isElementNode(node) {
        return node.nodeType === 1;
    }

    //是不是指令
    isDirective(name) {
        return name.includes('v-');
    }


    // 核心方法
    compileElement(node) {
        //带v-model
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            //判断属性名是否包含 v-
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                //去掉对应的值 放到节点中
                let expr = attr.value;
                // let type = attrName.slice(2);
                let [, type] = attrName.split('-');
                //node this.vm.$data expr
                CompileUtil[type](node, this.vm, expr);
            }
        })
    }
    compileText(node) {
        //带{{}}
        let expr = node.textContent; //取文本中的内容
        let regexp = /\{\{([^}]+)\}\}/g; //{{a}}  {{b}}  {{c}}
        if (regexp.test(expr)) {
            //node this.vm.$data expr
            CompileUtil['text'](node, this.vm, expr);
        }
    }
    compile(fragment) {
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                this.compileElement(node);
                this.compile(node);
            } else {
                this.compileText(node);
            }
        })
    }
    node2fragment(el) { //需要将el中的内容全部放入内存
        //文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);

        }
        return fragment; //内存中的节点
    }
}


CompileUtil = {

    getVal(vm, expr) { //获取实例上的数据
            expr = expr.split('.'); //a.b.c     ['a','b','c']
            return expr.reduce((prev, next) => { //vm.$data.a
                return prev[next];
            }, vm.$data);
        },
        getTextValue(vm, expr) { //获取编译文本后的结果
            return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
                return this.getVal(vm, arguments[1])
            })
        },
        text(node, vm, expr) { //文本处理
            let updateFn = this.updater['textUpdater'];
            let value = this.getTextValue(vm, expr);
            //{{a}}  {{b}}
            expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
                new Watcher(vm, arguments[1], (newValue) => {
                    //如果数据变化了 文本节点需要重新获取依赖的数据 更新文本中的内容
                    updateFn && updateFn(node, this.getTextValue(vm, expr));
                })
            })
            updateFn && updateFn(node, value);
        },
        setVal(vm, expr, value) {
            expr = expr.split('-');
            return expr.reduce((prev, next, currentIndex) => {
                if (currentIndex === expr.length - 1) {
                    return prev[next] = value;
                }
                return prev[next];
            }, vm.$data)
        },
        model(node, vm, expr) { //输入框处理
            let updateFn = this.updater['modelUpdater'];
            //这里应该加一个监控 数据变化了 应该调用了这个watch的callback 
            new Watcher(vm, expr, newValue => {
                //当值变化后会调用cb 将新的值 传递过滤
                updateFn && updateFn(node, this.getVal(vm, expr));
            });
            node.addEventListener('input', (e) => {
                let newValue = e.target.value;
                this.setVal(vm, expr, newValue);
            })
            updateFn && updateFn(node, this.getVal(vm, expr));
        },
        updater: {
            textUpdater(node, value) {
                    node.textContent = value;
                },
                modelUpdater(node, value) {
                    node.value = value;
                }
        }


}
