export interface UserToken {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  token_type?: string;
  userInfo?: UserInfo;
}

export interface UserInfo {
  items?: Menu[];
  roles?: Role[];
  userData?: User;
}

export interface Menu {
  id: string;
  active?: boolean;
  routerLink: string;
  title?: string;
  icon?: string;
  ord?: number;
  open?: boolean;
  parentId?: string;
  items?: Menu[];
  matched?: boolean;
  method?: string;
  navTitle?: boolean;
  tags?: string;
  grantedComponent?: [];
}
export interface Role {
  roleId: string;
  roleCode: string;
  roleName: string;
  description?: string;
  status?: string;
  ipOfficeWan?: string;
}

export interface User {
  accountTypeBccs?: string;
  cellphone?: string;
  channelCode?: string;
  channelMsisdn?: string;
  channelName?: string;
  channelTypeId?: number;
  channelTypeIdStaff?: number;
  companyId?: string;
  deptName?: string;
  district?: string;
  email?: string;
  fullName?: string;
  gender?: string;
  id?: string;
  idNo?: string;
  identityCard?: string;
  ip: string;
  level?: string;
  lstRoleUser?: string;
  name?: string;
  parentShopId?: number;
  posId?: string;
  province?: string;
  provinceName?: string;
  shopAddr?: string;
  shopCode?: string;
  shopId?: number;
  shopIdBranch?: number;
  shopLevel?: number;
  shopLevelName?: string;
  shopName?: string;
  shopPath?: string;
  staffCode?: string;
  staffId?: number;
  staffName?: string;
  status?: string;
  telShop?: string;
  telStaff?: string;
  telephone?: string;
  userId?: string;
  userName?: string;
}
