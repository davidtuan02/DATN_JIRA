import { Injectable } from '@angular/core'
import { HttpParams } from '@angular/common/http'
import { ApiService } from '../../../../shared/services/api.service'

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  PREFIX_API_USER = '/customs-gov/admin-service/api'

  constructor(private api: ApiService) {}

  deleteRequest(id: any) {
    return this.api.delete<any>(this.PREFIX_API_USER + `/admin-account/delete-request-register-by-request-id/${id}`)
  }

  getInfoAccAdmin(id: any) {
    return this.api.get<any>(this.PREFIX_API_USER + `/admin-account/view-detail-request-register-by-request-id/${id}`)
  }

  search(id: any, body: any) {
    return this.api.post(
      this.PREFIX_API_USER + `/admin-account/search-request-register-by-admin-account-id/${id}`,
      body
    )
  }
}
