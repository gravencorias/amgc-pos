import type { DrawerProps } from "antd";

declare const PlacementTypes: ["top", "left", "right", "bottom"];
export declare type placementType = (typeof PlacementTypes)[number];

export interface IDrawer {
  properties: DrawerProps;
  body?: React.ReactNode;
}
