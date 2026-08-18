/* F9 cabinet port loader.
   Kept here so the existing Visual Lab game system remains untouched. */
(()=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='f9-port.css?v=20260819-1';
  document.head.appendChild(css);

  const js=document.createElement('script');
  js.src='f9-port.js?v=20260819-1';
  js.defer=true;
  document.body.appendChild(js);
})();
