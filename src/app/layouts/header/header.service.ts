import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpParams } from '@angular/common/http'
import { ApiService } from '../../shared/services/api.service'

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  PREFIX_API_USER = '/customs-gov/admin-service/api'
  constructor(private api: ApiService) {}

  getUserInfo(taxCode: string) {
    const params = new HttpParams().set('taxCode', taxCode)
    return this.api.get<any>(this.PREFIX_API_USER + '/user-id/get-by-tax-code', { params })
  }

  logout() {
    return this.api.get<any>(this.PREFIX_API_USER + '/admin-account/logout')
  }
}
