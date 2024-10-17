import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AccountRegisterService {
  PREFIX_API = '/customs-gov/admin-service/api';
  constructor(private api: ApiService) { }

  register(id: any, body: any) {
    return this.api.post<any>(this.PREFIX_API + `/admin-account/register/business-info/${id}`, body);
  }

  getCertInfo(param: any) {
  const params = new HttpParams().set('account', param);
  return this.api.get<any>(this.PREFIX_API + '/certificate-info', {params});
  }

  checkRegisterUserId(body: any) {
    return this.api.post<any>(this.PREFIX_API + '/admin-account/check-userid-register', body);
  }
}
