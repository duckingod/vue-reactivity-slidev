---
# try also 'default' to start simple
theme: default
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

# Vue Reactivity

---

# Old days

<PasswordStrengthOld/>

Register a listener to listen changes of password and update strength 

```html
Password: <input id="password"/> <br/>
Strength: <span id="strength"></span>
```

```js {1-4|4|1-3}
const handlePasswordChange = (val) => {
  $('#strength').text(val.target.value.length >= 8 ? 'strong' : 'weak');
}
$('#password').on('input', handlePasswordChange);
```

Maybe it's not too hard to understand, but we need to control the data flow carefully.

---

# Magic!

<PasswordStrengthOld/>

```vue {1-10|8|3}
<template>
Password: <input v-model="password"/> <br/>
Strength: <span> {{ strength }} </span>
</template>

<script>
const password = ref("");
const strength = computed(() => password.value.length >= 8 ? 'strong' : 'weak');
</script>
```

- Vue automatically tracks the data flow in `computed`
  - `password` is accessed, so `password` changed means `strength` might also be changed
- Result
  - Vue update `strength` after change `password`.
  - update value in `span` after `strength` updated.

---

# What is Reactivity

```js {monaco}
let A0 = 1
let A1 = 2
let A2 = A0 + A1

console.log('A0 + A1 =', A0 + A1)
console.log('A2 =', A2)

A0 = 2
console.log('A0 + A1 =', A0 + A1)
console.log('A2 =', A2)
```

- `A2` didn't change, we have to notify the change like `handlePasswordChange`

---

# What is Reactivity

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

# What is Reactivity: One Way Data Binding

```js
function update() {
  A2 = A0 + A1; // 1
}

A0 = 2
update(); // 2
```
<br/>

1. `track`: When `update`, track and subscribe when a variable is read
    - Both A0 and A1 are read when compute A0 + A1.
    - `update` subscribe to `A1`, `A2`

2. `trigger`: Detect and re-compute when a subscribed variable is mutated
    - When `A0` is assigned a new value, notify all its subscriber effects to re-run.

---

# Reactive

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

# Reactive

- Proxy
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

# Ref

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

1. Destructure a reactive object's property to a local variable, the reactivity is "disconnected" because access to the local variable no longer triggers the get / set proxy traps.
```js {monaco}
state = reactive({ save: false })
save = state.save; // `save` loss reactivity
```

2. The returned proxy from reactive(), although behaving just like the original, has a different identity if we compare it to the original using the === operator.
```js {monaco}
original = { save: false };
stateA = reactive(original);
stateB = reactive(original);
console.log(stateA === stateB);
```

---

# Two Way Data Binding

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

# One Way Data Binding - Track

1. When `update`, track and subscribe when a variable is read
    - Both A0 and A1 are read when compute A0 + A1.
    - `update` subscribe to `A1`, `A2`

<div grid="~ gap-4" class="grid-cols-[1fr,2fr]">

<div>

```js {3-5}
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

```js
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

# Watch Effect  Compute

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

- Vue version

```html
Password: <input v-model="password"/> <br/>
Strength: {{ strength }}
```

```js
const password = ref('');
const strength = computed(() => password.length >= 8 ? 'strong' : 'weak');
```

---

# That's all, folks !

## Any question

---

# Additional Readings
- Vue document: [how-reactivity-works-in-vue](https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)
- Github: [@vue/reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)
