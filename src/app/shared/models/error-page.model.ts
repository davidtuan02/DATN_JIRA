export interface IBusinessError {
  createdBy: any;
  createdAt: any;
  updatedBy: any;
  updatedAt: any;
  status: number;
  id: number;
  businessCode: string;
  businessName: string;
}

export interface ISystemError {
  createdBy: any;
  createdAt: any;
  updatedBy: any;
  updatedAt: any;
  status: number;
  id: number;
  systemCode: string;
  systemName: string;
}

export interface IErrorLevel {
  createdBy: any;
  createdAt: any;
  updatedBy: any;
  updatedAt: any;
  status: number;
  id: number;
  name: string;
  nameSearch: string;
  parentId: number;
}

export interface IBodyErrorSearch {
  errorCode: string;
  errorType: string;
  business: string;
  errorMessage: string;
  cause: string;
  handlingDirection: string;
  errorStatus: string;
  createdDate: string;
  approvalAt: string;
  pageNum: number;
  pageSize: number;
}

export interface IDetailError {
  createdBy: any;
  createdAt: any;
  updatedBy: string;
  updatedAt: string;
  status: any;
  id: number;
  systemId: number;
  businessId: number;
  service: string;
  system: string;
  errorCode: string | number;
  errorType: string | number;
  business: string;
  errorMessage: string;
  cause: any;
  handlingDirection: string;
  processingUnit: string | number;
  requestingUnit: string;
  responsibleContactEmail: string;
  responsibleContactPhone: string;
  initialReporter: string;
  initialUnit: string;
  approver: string;
  errorStatus: string | number;
  startTime: any;
  endTime: any;
  notes: string;
  frequencyDay: number;
  frequencyMinute: number;
  otherResolutionTime: number;
  lstErrorLevelId: any[];
  approvedBy: any;
  approvedAt: any;
  reason: any;
  requestingContact: any;
  frequency: any;
  result: any;
  errorLevel: string;
}
