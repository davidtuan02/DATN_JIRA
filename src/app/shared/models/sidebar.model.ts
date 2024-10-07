interface ItemModel {
    title?: string;
    router?: string;
    open?: boolean;
}

export interface SidebarModel extends ItemModel {
    children?: ItemModel[]
}