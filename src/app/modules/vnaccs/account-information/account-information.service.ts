import { Injectable } from '@angular/core'
import { ApiService } from '../../../shared/services/api.service'

@Injectable({
  providedIn: 'root'
})
export class AccountInformationService {
  URL: string = '/customs-gov/admin-service/api'

  constructor(private api: ApiService) {}

  getAdminInfo(id: number | string) {
    return this.api.get<any>(this.URL + `/admin-account/by-admin-account-id/${id}`)
  }

  getTerminalAccessKy(id: number | string) {
    return this.api.get<any>(this.URL + `/terminal-access-keys/get-by-admin-account-id/${id}`)
  }
}
