import { Injectable } from '@angular/core'
import { ApiService } from '../../../shared/services/api.service'
import { PaginateModel } from '../../../shared/models/common.model'
import { Observable } from 'rxjs'
import { HttpParams } from '@angular/common/http'
import { ApiAdminService } from '../../../shared/services/api-admin.service'

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  PREFIX_API = '/customs-gov/admin-service/api'
  constructor(private api: ApiService, private apiAdmin: ApiAdminService) {}

  update(id: any, body: any) {
    return this.api.put<any>(this.PREFIX_API + `/admin-account/update-account-admin/${id}`, body)
  }

  register(body: any) {
    return this.api.post<any>(this.PREFIX_API + '/admin-account', body)
  }

  getCertInfo(param: any) {
    const params = new HttpParams().set('account', param)
    return this.api.get<any>(this.PREFIX_API + '/certificate-info', { params })
  }
}
