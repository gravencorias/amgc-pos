// The keyboard shortcuts, always visible under the menu.
const SHORTCUTS: [string[], string][] = [
  [["F2"], "Search"],
  [["↑", "↓", "←", "→"], "Move"],
  [["Enter"], "Add"],
  [["+", "−"], "Quantity"],
  [["F4"], "Discount"],
  [["F8"], "Dine-in or take-out"],
  [["F9"], "Charge"],
  [["Del"], "Clear"],
];

const RegisterShortcutBar = () => (
  <div className="amgc-register__keys" aria-label="Keyboard shortcuts">
    {SHORTCUTS.map(([keys, label]) => (
      <span key={label}>
        {keys.map((k) => (
          <kbd key={k} className="amgc-kbd">
            {k}
          </kbd>
        ))}
        {label}
      </span>
    ))}
  </div>
);

export default RegisterShortcutBar;
