// replace code in node_modules/@slidev/client/iframes/monaco/index.ts

editor.onKeyDown((e) => {
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
    e.preventDefault()
    format()
  }
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyR') {
    try {
      console.log('========= Run ======');
      eval(props.code);
      console.log('==== End of run ====');
    } catch (error) {
      console.error(error);
    }
  }
});