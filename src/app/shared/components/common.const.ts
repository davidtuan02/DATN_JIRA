export const COMMON_STATUS = [
  {
    value: 1,
    label: 'common.active',
  },
  {
    value: 0,
    label: 'common.inactive',
  },
];

export const PREFIX_API = '/manager-service/api/v1';

export const INIT_PAGE = 1;

export const INIT_SIZE = 10;

export const DATE_FORMAT = {
  API: 'yyyy-MM-dd HH:mm:ss',
  TABLE: 'dd/MM/yyyy HH:mm:ss',
  COMMON: 'dd/MM/yyyy'
}

export const TABLE_SIZE = [
  {value: 10, label: '10'},
  {value: 15, label: '15'},
  {value: 20, label: '20'},
]

export const CUSTOMER_TABLE_SIZE = [
  {value: 10, label: '10'},
  {value: 15, label: '15'},
  {value: 20, label: '20'},
]

export const DATE_PICKER_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const FILE_STATUS = [
  { value: 1, label: 'Đang hiển thị' },
  { value: 0, label: 'Đang tắt' },
];

export const FILE_TYPE = [
  { value: 1, label: 'File hướng dẫn' },
  { value: 2, label: 'File thông báo' },
  { value: 3, label: 'File video hướng dẫn' }
];

export const FILE_SIZE = 5 * 1024 * 1024;

export const FILE_TYPE_VALID = /\.(xls|xlsx)$/i

export const LOCALE = 'en-US'
