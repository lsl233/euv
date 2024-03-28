
let activeEffect

// target -> key -> effectFn
const bucket = new WeakMap()

const data = {
    text: 'hello euv',
    ok: true
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
        activeEffect.deps.push(deps)
    }
}

/**
 * 触发更新
 */
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    if (!effects) return
    const effectsToRun = new Set(effects)
    effectsToRun.forEach(fn => fn())
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
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        fn()
    }

    effectFn.deps = []

    effectFn()
}

function cleanup (effectFn) {
    for (const deps of effectFn.deps) {
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

effect(() => {
    // obj.ok 的值不同，会执行不同的代码分支，这就是分支切换
    document.body.innerText = obj.ok ? obj.text : 'not'
})

setTimeout(() => {
    obj.text = 'euv hello'
}, 3000)