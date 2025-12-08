export function dispatchToast(text: string, type: 'DANGER' | 'WARNING' | 'SUCCESS') {
  const el = document.createElement('span');
  el.innerText = text;
  el.style.padding = '8px 12px';
  el.style.maxWidth = '350px';
  el.style.position = 'fixed';
  el.style.zIndex = '9999';
  el.style.top = '50px';
  el.style.right = '-100%';
  el.style.backgroundColor = type === 'DANGER' ? 'red' : type === 'WARNING' ? 'yellow' : 'green';
  el.style.color = 'white';
  el.style.fontFamily = '"Maven-Pro-Regular", sans-serif';
  el.style.borderTopLeftRadius = '6px';
  el.style.borderBottomLeftRadius = '6px';
  el.style.transition = 'right .5s ease-in-out';
  document.querySelector('klubr-sponsorship-form')?.shadowRoot?.appendChild(el);

  setTimeout(() => {
    el.style.right = '0';
  }, 100);
  setTimeout(() => {
    el.style.right = '-100%';
  }, 4000);
  setTimeout(() => {
    document.querySelector('klubr-sponsorship-form')?.shadowRoot?.removeChild(el);
  }, 5000);
}
