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

```js {4|1-3}
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
updateA2SideEffect(); // initialize A2

function updateA2SideEffect() {
  A2 = A0 + A1;
}

console.log('A2 =', A2);

A0 = 2
updateA2SideEffect();
console.log('A0 + A1 =', A0 + A1);
console.log('A2 =', A2);
```

---

# What is Reactivity

```js {12-14}
let A0 = 1;
let A1 = 2;
let A2;
update(); // initialize A2

function update() {
  A2 = A0 + A1;
}

console.log('A2 =', A2);

A0 = 2
update();
console.log('A2 =', A2);
```
<br/>
We gonna make this happen automatically

---

# Concepts

- The `update()` function produces a **side effect**, or **effect** for short,  
  because it modifies the state of the program.
- `A0` and `A1` are considered **dependencies** of the effect,  
  as their values are used to perform the effect. The effect is said to be a **subscriber** to its dependencies.

We define `whenDepsChange(update)` which invokes `update()` to update 
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
console.log('access value', count.value);
count.value = 10;
```

---

# Track the Dependencies

Track when a variable is read. E.g. when evaluating the expression A0 + A1, both A0 and A1 are read.

If a variable is read when there is a currently running effect, make that effect a subscriber to that variable. E.g. because A0 and A1 are read when update() is being executed, update() becomes a subscriber to both A0 and A1 after the first call.

Detect when a variable is mutated. E.g. when A0 is assigned a new value, notify all its subscriber effects to re-run.



# Additional Readings
- Vue document: [how-reactivity-works-in-vue](https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)
- Github: [@vue/reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)
