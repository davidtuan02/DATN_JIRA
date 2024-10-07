import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { IErrorLevel } from './error-page.model';

export interface IApiOption {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  nameSearch: string;
  id: number;
  level: number;
  disabled?: boolean;
}

export interface TreeNode extends IErrorLevel {
  children?: TreeNode[];
  disabled?: boolean;
}

export interface ImportModel {
  content: any;
  totalItems: number;
  totalItemsInserted: number;
}

export interface PaginateModel {
  page: number;
  size: number;
}
