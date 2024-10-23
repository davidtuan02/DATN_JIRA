import { Injectable } from '@angular/core'
import { HttpParams } from '@angular/common/http'
import { ApiService } from '../../../../shared/services/api.service'

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  PREFIX_API = '/customs-gov/admin-service/api/file'
  PREFIX_API_USER = '/customs-gov/admin-service/api'

  constructor(private api: ApiService) {}

  search(id: any, body: any) {
    return this.api.post(
      this.PREFIX_API_USER + `/admin-account/search-request-register-by-admin-account-id/${id}`,
      body
    )
  }
}
