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

- Image we have a `password` list in the screen, show if the password is strong enough

<Card>
  Password: <input/> <BR/>
  Level: weak
</Card>

To change the password and show password strength instantly, we need

```js
let password = 'qwerty'
const onPasswordChanged = (value) => {
    $.('id=password').value = value;
  if (value.length <= 6)
    $.('id=level').value = 'weak';
  else
    $.('id=level').value = 'strong';
};

password = 'qwertyasdfgh';
onPasswordChanged();

password = 'qwertyasdfgh';
onPasswordChanged();
```


---

# Magic!
<BR/>

```js
const passwords = ref(['abcdefgh', 'aaa', 'qwerty']);
const weakPasswords = computed(() => passwords.value.filter((name) => name.length <= 6));

console.log(weakPasswords.value);
// output ['aaa', 'qwerty']

passwords.value.append('123');
console.log(weakPasswords.value);
// output ['aaa', 'qwerty', '123']
```

---

# Recap (Proxy)

- IE doesn't support QQ
- We could mock object's behavior, for example, `get`, `set`, `has`
```js {monaco}
const original = { itemName: 'pen' };
const proxied = new Proxy(original, {
  get(target, key) {
    return `Chris' ${target[key]}`;
  }
})
console.log(proxied.itemName);
proxied.itemName = 'pencil';
console.log(proxied.itemName);
```

---

# Reactive

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

---

# Ref

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

# Additional Readings
- Vue document: [how-reactivity-works-in-vue](https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)
- Github: [@vue/reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)
