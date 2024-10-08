import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { PaginateModel } from '../../../shared/models/common.model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { PREFIX_API } from '../../../shared/components/common.const';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  PREFIX_API = '/customs-gov/admin-service/api/file';
  PREFIX_API_USER = '/customs-gov/admin-service/api/user-id';
  constructor(private api: ApiService) {}

  streamVideo(body: any) {
    return this.api.post<any>(this.PREFIX_API + '/stream-video', body);
  }

  getCertInfo(param: any) {
  const params = new HttpParams().set('account', param);
  return this.api.get<any>(this.PREFIX_API + '/certificate-info', {params});
  }

  getUserInfo(taxCode: string) {
    const params = new HttpParams().set('taxCode', taxCode);
    return this.api.get<any>(this.PREFIX_API_USER + '/get-by-tax-code', {params});
  }

  downloadNotiFile(id: string) {
    return this.api.get<any>(this.PREFIX_API + `/notification/${id}`);
  }

  downloadGuideFile() {
    return this.api.get<any>(this.PREFIX_API + '/getGuideFile');
  }

  getAllNotiFile() {
    return this.api.get<any>(this.PREFIX_API + '/getAllNotificationFile');
  }

  getGuideVideoFile() {
    return this.api.get<any>(this.PREFIX_API + '/getGuideVideo');
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
