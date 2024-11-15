import { Injectable } from '@angular/core'
import { ApiService } from '../../../../shared/services/api.service'
import { HttpParams } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class AccountInfoService {
  PREFIX_API = '/customs-gov/admin-service/api'
  constructor(private api: ApiService) {}

  getListUserId(id: number | string) {
    return this.api.get<any>(this.PREFIX_API + `/user-id/get-by-admin-account-id/${id}`)
  }
}
