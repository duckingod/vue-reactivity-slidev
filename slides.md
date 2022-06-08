---
# try also 'default' to start simple
theme: default
background: https://images.unsplash.com/photo-1502189562704-87e622a34c85?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  Vue reactivity example
# persist drawings in exports and build
drawings:
  persist: false
---

# Vue Reactivity API


---

# Outline

- Vue Basics
- Concept
  - What is reactivity
- Core Mechanism Implement
  - What is reactivity
  - Limitation
  - One Way Data binding
- Extra Topics
  - Watch Effect v.s. Computed
  - Update DOM
  - Reactivity on Watch (Callback, reactive, ref)
---

# Vue Basics
Script, template, ref and computed

<PasswordStrength/>

```vue {1-10|1-5|7-10|3,8|4,9|1-10}
<script setup>
import { ref, computed } from 'vue';
const password = ref("");
const strength = computed(() => password.value.length >= 8 ? 'strong' : 'weak');
</script>

<template>
Password: <input v-model="password"/> <br/>
Strength: {{ strength }}
</template>
```

- Password input bind to the `password` variable
- `strength` is updated automatically after `password` changed.

---

# Vue Basics (Old days...)
Control the data flow carefully

<PasswordStrengthOld/>

Register a listener to listen changes of password and update strength 

```html
Password: <input id="password"/> <br/>
Strength: <span id="strength"></span>
```

```js {1-5|4|5|1-3}
const handlePasswordChange = (val) => {
  $('#strength').text(val && val.target.value.length >= 8 ? 'strong' : 'weak');
}
handlePasswordChange('')
$('#password').on('input', handlePasswordChange);
```

---

# Vue Basics (Magic!)
Control the data flow **automatically**


<PasswordStrength/>

<div grid="~ gap-4" class="grid-cols-[1fr,1fr]">
<div>

```html
Password: <input id="password"/> <br/>
Strength: <span id="strength"></span>
```

```js
const handlePasswordChange = (val) => {
  $('#strength').text(
    val && val.target.value.length >= 8
      ? 'strong'
      : 'weak')
}
handlePasswordChange('')
$('#password').on('input', handlePasswordChange)
```

</div>
<div>

```vue {1-12|3-6,11}
<script>
const password = ref("");
const strength = computed(() =>
  password.value.length >= 8
    ? 'strong'
    : 'weak');
</script>

<template>
Password: <input v-model="password"/> <br/>
Strength: {{ strength }}
</template>
```

</div>

</div>

---

# Vue Basics (Magic!)
Control the data flow **automatically**

<PasswordStrength/>

```vue {1-10|3|8}
<script>
const password = ref("");
const strength = computed(() => password.value.length >= 8 ? 'strong' : 'weak');
</script>

<template>
Password: <input v-model="password"/> <br/>
Strength: <span> {{ strength }} </span>
</template>

```

- Vue automatically tracks the data flow in `computed`
- Result
  - Update `strength` after change `password`.
  - Update value in `span` after `strength` updated.

---

# What is Reactivity
Automatically notify & update related value

```js {monaco}
let A0 = 1
let A1 = 2
let A2 = A0 + A1

A0 = 2
console.log('A0 + A1 =', A0 + A1)
console.log('A2 =', A2)
```

- `A2` didn't change, we have to notify the change like `handlePasswordChange`

---

# What is Reactivity
Automatically notify & update related value

```js {monaco}
let A0 = 1;
let A1 = 2;
let A2;
update(); // initialize A2

function update() {
  A2 = A0 + A1;
}

A0 = 2
update();
console.log('A2 =', A2);
```

---

# What is Reactivity
Automatically notify & update related value

```js {10-11}
let A0 = 1;
let A1 = 2;
let A2;
update(); // initialize A2

function update() {
  A2 = A0 + A1;
}

A0 = 2
update();
console.log('A2 =', A2);
```
<br/>

- The `update()` function produces a **side effect**, or **effect** for short,  
  because it modifies the state of the program.
- `A0` and `A1` are considered **dependencies** of the effect,  
  as their values are used to perform the effect.  
  The effect is said to be a **subscriber** to its dependencies.

---

# What is Reactivity
Automatically notify & update related value

```js
function update() {
  A2 = A0 + A1; // 1
}

A0 = 2
update(); // 2
```
<br/>

Hope it

1. `track`: When `update`, track and subscribe when a variable is read
    - Both A0 and A1 are read when compute A0 + A1.
    - `update` subscribe to `A0`, `A1`

2. `trigger`: Detect and re-compute when a subscribed variable is mutated
    - When `A0` is assigned a new value, notify all its subscriber effects to re-run.

---

# What is Reactivity (reactive)
Automatically notify & update related value

- Proxy
  - Track dependency in `get`
  - Emit value change event in `get`

```js {1-13|3-6|7-11|1-14}
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      trigger(target, key)
      target[key] = value
      return value
    }
  })
}
const state = reactive({ save: false });
```

---

# What is Reactivity (reactive)
Automatically notify & update related value

- Track dependency in `get`
- Emit value change event in `get`

```js {monaco}
const track = (target, key) => console.log('track', target, key);
const trigger = (target, key) => console.log('trigger', target, key);
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      trigger(target, key)
      target[key] = value
      return value
    }
  })
}
const state = reactive({ save: false });
```
<!--
  1. Demo the === case (fail)
  2. Tell the destruct make reactivity disconnected
     const state = reactive({ status: { save: false } })
     const status = state.status
     computed(() => !status); // not tracked!
-->
---

# What is Reactivity (ref)
Automatically notify & update related value

- `getter`, `setter` on `value`

```js {monaco}
const track = (target, key) => console.log('track', target, key);
const trigger = (target, key) => console.log('trigger', target, key);

function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      trigger(refObject, 'value')
      value = newValue
    }
  }
  return refObject
}
const count = ref(0);
```

---

# Limitation
Due to **Proxy**, we cannot ...

1. Destructure a reactive object's property to a local variable, the reactivity is "disconnected" because access to the local variable no longer triggers the get / set proxy traps.
```js {monaco}
state = reactive({ save: false })
save = state.save; // `save` loss reactivity
```

2. The returned proxy from `reactive()` has a different identity if we compare it to the original using the === operator.
```js {monaco}
original = { save: false };
state = reactive(original);
console.log(state === original);
```

---

# One Way Data Binding
**Track** dependency and **trigger** update effects

```js
function update() {
  A2 = A0 + A1; // 1
}

A0 = 2
update(); // 2
```
<br/>

1. When `update`, track and subscribe when a variable is read
    - Both A0 and A1 are read when compute A0 + A1.
    - `update` subscribe to `A1`, `A2`

2. Detect and re-compute when a subscribed variable is mutated
    - When `A0` is assigned a new value, notify all its subscriber effects to re-run.

---

# One Way Data Binding - Track
**Track** dependency and **trigger** update effects

1. When `update`, track and subscribe when a variable is read
    - Both A0 and A1 are read when compute A0 + A1.
    - `update` subscribe to `A1`, `A2`
<div grid="~ gap-4" class="grid-cols-[1fr,2fr]">

<div>
```js {|9-12|1-8|7|3-5|4|11}
function watchEffect(update) {
  const effect = () => {
    activeEffect = effect
    update()
    activeEffect = null
  }
  effect()
}
let A2 = ref();
watchEffect(() => {
  A2.value = A0.value + A1.value
});
```
</div>

<div>
```js {1|3-8}
let activeEffect // set to currently updating effect

function track(target, key) {
  if (activeEffect) {
    getSubscribers(target, key).add(activeEffect)
  }
}
```


</div>

</div>

---

# One Way Data Binding - Trigger
**Track** dependency and **trigger** update effects

2. Detect and re-compute when a subscribed variable is mutated
    - When `A0` is assigned a new value, notify all its subscriber effects to re-run.

<div style="height: 32px"></div>

<div grid="~ gap-4" class="grid-cols-[1fr,2fr]">

<div>

```js {20|3-5}
function watchEffect(update) {
  const effect = () => {
    activeEffect = effect
    update()
    activeEffect = null
  }
  effect()
}
let A2 = ref();
watchEffect(() => {
  A2.value = A0.value + A1.value
});
```

</div>

<div>

```js {20}
let activeEffect // set to currently updating effect

function track(target, key) {
  if (activeEffect) {
    getSubscribers(target, key).add(activeEffect)
  }
}
```

```js
// A0.value = 2
function trigger(target, key) {
  getSubscribers(target, key).forEach((effect) => effect());
}
```

</div>

</div>

---

# Watch Effect v.s. Compute
To write clean code

- Before
```js
let A2 = ref();
watchEffect(() => {
  A2.value = A0.value + A1.value
});
```

<br/>

- After
```js
let A2 = computed(() => A0.value + A1.value);
```

---

# Update DOM
To write clean code


```html
Password: <input id="password"/> <br/>
Strength: <span id="strength"></span>
```

<br/>

- JQuery version

```js
const handlePasswordChange = (val) => {
  $('#strength').text(val.target.value.length >= 8 ? 'strong' : 'weak');
}
$('#password').on('input', handlePasswordChange);
```

- Reactive version

```js
const password = ref('');
const strength = computed(() => password.length >= 8 ? 'strong' : 'weak');

$('#password').on('input', (event) => password.value = event.target.value);
watchEffect(() => {
  $('#strength').text(strength.value);
});
```

---

# Update DOM
To write clean code

- Vue version

```vue
<template>
Password: <input v-model="password"/> <br/>
Strength: {{ strength }}
</template>

<script>
const password = ref('');
const strength = computed(() => password.length >= 8 ? 'strong' : 'weak');
</script>
```

- DOM is updated in `nextTick()`

---

# Reactivity on Watch
Look a little deeper into `watch`

There are 4 ways to use watch, we are going to discuss 1. 2. 3. among them.

```js
const saved = ref(false);
const state = reactive({ status: { saved: false } });

const watchHandler = () => state.status.saved && console.log('Saved!')
// 1. pass callback
watch(() => saved.status.saved, watchHandler);

// 2. pass reactive
watch(state, watchHandler);

// 3. pass ref
watch(saved, watchHandler);

// 4. pass array of three types above
watch([state], watchHandler);
```

---

# Reactivity on Watch (Callback)
Look a little deeper into `watch`

```js
const saved = ref(false);
const state = reactive({ status: { saved: false } });
const watchHandler = () => state.status.saved && console.log('Saved!');
watch(() => state.status.saved, watchHandler);
```

<br/>

- Collecting trapped dependency in `track` when `() => state.status.saved` invoked
- Result
  1. Collect `state -> status` by `state.status`
      - `watch` is triggered when `state.status = /* ... */`
  2. Collect `status -> saved` by `status.saved`
      - `watch` is triggered when `state.status.saved = /* ... */`

---

# Reactivity on Watch (Examples)
Will `watch` be triggered? Click to view explanations.

<div class="grid grid-cols-2 gap-3 my-2">

<FlipCard>
<template v-slot:default>

```js
watch(
  () => state.status, watchHandler
)
state.status.saved = true;
```

</template>
<template v-slot:flip>
<h3 class="text-red-600">No</h3>

Collected only `state.status` dependency, but triggered on `status.saved`

</template>
</FlipCard>

<FlipCard>
<template v-slot:default>

```js
const { status } = state;
watch(
  () => status.saved, watchHandler
)
status.saved = true;
```

</template>
<template v-slot:flip>
<h3 class="text-red-600">Yes (not recommended)</h3>

Reactivity disconnected in this situation, since we only track `.saved` on the original object.

```js
state.status = { saved: false }
state.status.saved = true; // not trigger
```

</template>
</FlipCard>

<FlipCard>
<template v-slot:default>

```js
watch(
  () => state, watchHandler
)
saved.value = true;
```

</template>
<template v-slot:flip>
<h3 class="text-red-600">No</h3>

Not track on anything. 

</template>
</FlipCard>

<FlipCard>
<template v-slot:default>

```js
const saved = ref(false)
watch(
  () => saved, watchHandler
)
saved.value = true;
```

</template>
<template v-slot:flip>
<h3 class="text-red-600">No</h3>

Treated as callback and not track on anything.

</template>
</FlipCard>

</div>

---

# Reactivity on Watch (Reactive)
Look a little deeper into `watch`

```js
const state = reactive({ status: { saved: false } });
watch(state, watchHandler);
```

Equivalent to perform *DFS* on the object to `track` on every key, that is
```js
const dfs = (obj) => {
  Object.entries(obj).forEach( /* ... */ )
  // ...
};
watch(() => dfs(state), watchHandler);
```

Might low in performance, every change on the object triggers `watch`, and another `dfs` is invoked to re-calculate dependencies each time.

---

# Reactivity on Watch (Ref)
Look a little deeper into `watch`

- Default: Track on `.value` only
```js
const saved = ref(false);
watch(saved, watchHandler);
// Equivalent to
watch(() => saved.value, watchHandler);
```

<br/>

- With `{ deep: true }`: Track on `.value` and all nested keys.

```js
const state = ref({ status: { saved: false }});
watch(state, watchHandler, { deep: true });
// Equivalent to
watch(() => dfs(saved.value), watchHandler);
```

<br/>

> Notice that `ref({ a: 1 }).value` is also a `reactive`, thus we could track dependencies in it.

---

# Reactivity on Watch (Example)
When will `watch` be triggered?

```js
const state = ref({ status: { saved: false } });
watch(state, watchHandle);
watch(state.value, watchHandle);
watch(() => state, watchHandle);
watch(() => state.value, watchHandle);
watch(() => state.value.status, watchHandle);
```

---

# That's all, folks!
Q & A Time!


<br/>
<br/>

### You might also curious about ...
- Ref v.s. Reactive
  <!--
    - Reactive is deep by default
    - Passing some large object / deep object by shallow reactive since props is a reactive
  -->
- Vue2 Vue3 Difference
  <!--
    - more flexible
    - vue2 data bind on keys of `data` or vuex, vue3 you can declare data everywhere
    - vue2 cannot set array, vue 3 can since ref.value response a proxy: proxy can aware array change
  -->

---

# Appendix: Ref v.s. Reactive
In case you're curious about it

```js
# https://github.com/vuejs/core/blob/0cf9ae62be21a6180f909e03091f087254ae3e52/packages/reactivity/src/ref.ts#L104-L112
class RefImpl<T> {
  // ...
  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }
  // ...
}
```

Basically the same!  
Choose one that make your code neat.

---

# Appendix: Vue2 Vue3 Difference
In case you're curious about it

- `Proxy` (`reactive`) is aware of object key / array change
  - No more `Vue.set` in Vue3
- More flexible

---

# Appendix: Additional Readings
- Vue document: [how-reactivity-works-in-vue](https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)
- Github: [@vue/reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)

---
