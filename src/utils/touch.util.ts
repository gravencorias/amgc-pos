// Touch mode, for code that isn't a component (timers, module-level helpers). Components use
// useTouchMode(); app.hook mirrors its answer on <html data-touch="true">, which this reads.
export const isTouchMode = () => document.documentElement.dataset.touch === "true";
