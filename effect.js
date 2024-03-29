


// target -> key -> effectFn
const bucket = new WeakMap()

const data = {
    foo: 'hello euv',
    bar: true
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

let activeEffect
const effectStack = []
function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }

    effectFn.deps = []

    effectFn()


}

/**
 * effectFn.deps 存放依赖的Set
 * effectFn.deps = WeekMap.Map.Set
 *
 */

function cleanup (effectFn) {
    for (const deps of effectFn.deps) {
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

effect(() => {
    console.log('effect 1')
    effect(() => {
        console.log('effect 2')
        obj.bar
    })
    obj.foo
})

setTimeout(() => {
   obj.bar = 222
}, 3000)