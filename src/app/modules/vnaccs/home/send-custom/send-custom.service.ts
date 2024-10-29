import { Injectable } from '@angular/core'
import { ApiService } from '../../../../shared/services/api.service'

@Injectable({
  providedIn: 'root'
})
export class SendCustomService {
  PREFIX_API = '/customs-gov/admin-service/api/file'
  PREFIX_API_USER = '/customs-gov/admin-service/api'

  constructor(private api: ApiService) {}

  sendCustom(id: any, body: any) {
    return this.api.post<any>(this.PREFIX_API_USER + `/admin-account/register-to-customs/${id}`, body)
  }

  checkSenddCustom(id: any, body: any) {
    return this.api.post<any>(this.PREFIX_API_USER + `/admin-account/check-digital-signature/${id}`, body)
  }
}
