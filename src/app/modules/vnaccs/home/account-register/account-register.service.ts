import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AccountRegisterService {
  PREFIX_API = '/customs-gov/admin-service/api';
  constructor(private api: ApiService) { }

  register(id: any, body: any) {
    return this.api.post<any>(this.PREFIX_API + `/admin-account/register/business-info/${id}`, body);
  }
}
