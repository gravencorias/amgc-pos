// How this device decides whether to use touch mode. Saved in the browser, per device.
export enum TouchModeEnum {
  // Touch mode when the main pointer is a finger (a tablet), not a mouse.
  auto = "auto",
  on = "on",
  off = "off",
}

export const touchModeLabel: Record<TouchModeEnum, string> = {
  [TouchModeEnum.auto]: "Auto",
  [TouchModeEnum.on]: "On",
  [TouchModeEnum.off]: "Off",
};
