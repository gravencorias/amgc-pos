import { Typography } from "antd";
import { Item, Menu, Separator } from "react-contexify";
import { EditIcon, PowerIcon, TrashIcon } from "../../assets/icons/Icons";
import type { IProductResponse } from "../../models/product/product.response.model";

const { Text } = Typography;

type IProps = {
  id: string;
  record: IProductResponse | null;
  onEdit: (record: IProductResponse) => void;
  onToggleAvailable: (record: IProductResponse) => void;
  onDelete: (record: IProductResponse) => void;
};

const ProductMenuList = ({ id, record, onEdit, onToggleAvailable, onDelete }: IProps) => (
  <Menu id={id} animation={false} className="amgc-row-menu">
    <Item disabled>
      <Text strong>{record?.name ?? "Actions"}</Text>
    </Item>

    <Item onClick={() => record && onEdit(record)}>
      <span className="amgc-row-menu__item">
        <EditIcon size={16} />
        Edit product
      </span>
    </Item>

    <Item onClick={() => record && onToggleAvailable(record)}>
      <span className="amgc-row-menu__item">
        <PowerIcon size={16} />
        {record?.isAvailable ? "Mark sold out" : "Back on the menu"}
      </span>
    </Item>

    <Separator />

    <Item onClick={() => record && onDelete(record)}>
      <span className="amgc-row-menu__item is-danger">
        <TrashIcon size={16} />
        Delete
      </span>
    </Item>
  </Menu>
);

export default ProductMenuList;
