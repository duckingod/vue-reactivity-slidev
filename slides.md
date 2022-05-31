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

# Magic!

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
  - `password` is accessed, so `password` changed means `strength` might also be changed
- Result
  - Vue update `strength` after change `password`.
  - update value in `span` after `strength` updated.

---

# What is Reactivity
Automatically notify & update related value

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
    - `update` subscribe to `A1`, `A2`

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

1. Destructure a reactive object's property to a local variable, the reactivity is "disconnected" because access to the local variable no longer triggers the get / set proxy traps.
```js {monaco}
state = reactive({ save: false })
save = state.save; // `save` loss reactivity
```

2. The returned proxy from reactive(), although behaving just like the original, has a different identity if we compare it to the original using the === operator.
```js {monaco}
original = { save: false };
state = reactive(original);
console.log(state === original);
```

---

# One Way Data Binding

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

# One Way Data Binding - Trigger

2. Detect and re-compute when a subscribed variable is mutated
    - When `A0` is assigned a new value, notify all its subscriber effects to re-run.

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

# Watch Effect v.s. Compute

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

# That's all, folks!

<br/>

## You might also curious about
- Ref v.s. Reactive
  <!--
    - Reactive is deep by default
    - Passing some large object / deep object by shallow reactive since props is a reactive
  -->
- Vue2 Vue3 Difference
  <!--
    - more flexible
    - vue2 data bind on keys of `data` or vuex, vue3 you can declare data everywhere
  -->


---

# Additional Readings
- Vue document: [how-reactivity-works-in-vue](https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)
- Github: [@vue/reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)