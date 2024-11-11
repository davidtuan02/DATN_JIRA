import { Injectable } from '@angular/core'
import { ApiService } from '../../../shared/services/api.service'
import { PaginateModel } from '../../../shared/models/common.model'
import { Observable } from 'rxjs'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { PREFIX_API } from '../../../shared/components/common.const'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  PREFIX_API = '/customs-gov/admin-service/api/file'
  PREFIX_API_USER = '/customs-gov/admin-service/api'

  constructor(private api: ApiService, private http: HttpClient) {}

  registerAccountInfo(id: any, type: any) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)!
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    return this.api.get<any>(
      this.PREFIX_API_USER + `/admin-account/register-business-info/exist-check/${id}?type=${type}`,
      { headers }
    )
  }

  getJDK() {
    return this.api.get<any>(this.PREFIX_API + '/getVersionJdk')
  }

  streamVideo(body: any) {
    return this.api.post<any>(this.PREFIX_API + '/stream-video', body)
  }

  getCertInfo(param: any) {
    const params = new HttpParams().set('account', param)
    return this.api.get<any>(this.PREFIX_API + '/certificate-info', { params })
  }

  getUserInfo(taxCode: string) {
    const params = new HttpParams().set('taxCode', taxCode)
    return this.api.get<any>(this.PREFIX_API_USER + '/user-id/get-by-tax-code', { params })
  }

  downloadNotiFile(id: string) {
    return this.api.get<any>(this.PREFIX_API + `/notification/${id}`)
  }

  downloadGuideFile() {
    return this.http.get('https://api-service.techasians.com/customs-gov/admin-service/api/file/getGuideFile', {
      responseType: 'blob'
    })
  }

  getAllNotiFile() {
    return this.api.get<any>(this.PREFIX_API + '/getAllNotificationFile')
  }

  getGuideVideoFile() {
    return this.api.get<any>(this.PREFIX_API + '/getGuideVideo')
  }

  getListUserId(taxCode: string) {
    return this.api.get(this.PREFIX_API_USER + `/user-id/get-by-tax-code?taxCode=${taxCode}`)
  }

  updatePasswordForUserId(body: any) {
    return this.api.patch(this.PREFIX_API_USER + '/user-id/change-passWord', body)
  }
}
