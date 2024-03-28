
let activeEffect

// target -> key -> effectFn
const bucket = new WeakMap()

const data = {
    text: 'hello euv'
}

/**
 * 依赖收集
 */
function track(target, key) {
    if (activeEffect) {
        let depsMap = bucket.get(target)
        if (!depsMap) {
            depsMap = new Map()
            bucket.set(target, depsMap)
        }
        let deps = depsMap.get(key)
        if (!deps) {
            deps = new Set()
            depsMap.set(key, deps)
        }
        deps.add(activeEffect)
    }
}

/**
 * 触发更新
 */
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    if (!deps) return
    deps.forEach(fn => fn())
}

const obj = new Proxy(data, {
    get(target, key) {
        track(target, key)
        return target[key]
    },

    set(target, key, newVal) {
        target[key] = newVal
        trigger(target, key)
        return true
    }

})
function effect(fn) {
    activeEffect = fn
    fn()
}

effect(() => {
    document.body.innerText = obj.text
})

setTimeout(() => {
    obj.text = 'euv hello'
}, 3000)