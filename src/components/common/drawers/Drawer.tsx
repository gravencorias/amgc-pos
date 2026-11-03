import { Drawer as AntDrawer } from "antd";
import { useDrawerStore } from "../../../stores/common/drawer.store";
import type { placementType } from "../../../models/common/drawer,model";

interface IProps {
  defaultPlacements?: placementType;
}
const Drawer = ({ defaultPlacements }: IProps) => {
  const { drawer, closeDrawer } = useDrawerStore();
  const { properties, body } = drawer;
  
  return (
    <>
      <AntDrawer
        placement={defaultPlacements ? defaultPlacements : "left"}
        {...properties}
        onClose={closeDrawer}
      >
        {body}
      </AntDrawer>
    </>
  );
};

export default Drawer;
