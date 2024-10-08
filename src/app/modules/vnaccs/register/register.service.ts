import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { PaginateModel } from '../../../shared/models/common.model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiAdminService } from '../../../shared/services/api-admin.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  PREFIX_API = '/customs-gov/admin-service/api';
  PREFIX_API_ADMIN = '/auth-service/api/business/authenticate';
  constructor(
    private api: ApiService,
    private apiAdmin: ApiAdminService
  ) {}

  register(body: any) {
    return this.api.post<any>(this.PREFIX_API +'/admin-account', body);
  }

  login(body: any) {
    return this.apiAdmin.post<any>(this.PREFIX_API_ADMIN, body);
  }

  getCertInfo(param: any) {
  const params = new HttpParams().set('account', param);
  return this.api.get<any>(this.PREFIX_API + '/certificate-info', {params});
  }

  search(body: any) {
    return this.api.post<any>(this.PREFIX_API + '/search', body);
  }

  create(body: any) {
    return this.api.post<any>(this.PREFIX_API, body);
  }

  update(id: string, body: any) {
    return this.api.patch<any>(this.PREFIX_API + `/${id}`, body);
  }

  delete(body: any) {
    return this.api.delete<any>(this.PREFIX_API, body);
  }

  detail(id: string) {
    return this.api.get<any>(this.PREFIX_API + `/${id}`);
  }

  updateStatus(id: string, params: any) {
    return this.api.patch<any>(this.PREFIX_API + `/update-status/${id}`, {}, {params: params})
  }

  readFile(filePath: string) {
  const params = new HttpParams().set('file', filePath);
  return this.api.get<any>(`${this.PREFIX_API}/readFile`, { params });
}




}
