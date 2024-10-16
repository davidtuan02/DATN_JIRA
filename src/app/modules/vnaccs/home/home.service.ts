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
  PREFIX_API_USER = '/customs-gov/admin-service/api';
  constructor(private api: ApiService) { }

  registerAccountInfo(id: any, type: any) {
    return this.api.get<any>(this.PREFIX_API_USER + `/admin-account/register-business-info/exist-check/${id}?type=${type}`);
  }

  streamVideo(body: any) {
    return this.api.post<any>(this.PREFIX_API + '/stream-video', body);
  }

  getCertInfo(param: any) {
  const params = new HttpParams().set('account', param);
  return this.api.get<any>(this.PREFIX_API + '/certificate-info', {params});
  }

  getUserInfo(taxCode: string) {
    const params = new HttpParams().set('taxCode', taxCode);
    return this.api.get<any>(this.PREFIX_API_USER + '/user-id/get-by-tax-code', {params});
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
}
