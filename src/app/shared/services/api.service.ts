import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { IApiOption } from '../models/common.model'
import { environment } from '../../../environments/environment.prod'
// import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly SERVER: string = environment.server
  constructor(private http: HttpClient) {}

  get<T>(path: string, option?: IApiOption): Observable<T> {
    return this.http.get<T>(this.SERVER + path, option)
  }

  getFormData(path: string): Observable<Blob> {
    return this.http.get(this.SERVER + path, { responseType: 'blob' })
  }

  post<T>(path: string, body: object, option?: IApiOption): Observable<T> {
    return this.http.post<T>(this.SERVER + path, body, option)
  }

  postFormData(path: string, body: object): Observable<Blob> {
    return this.http.post(this.SERVER + path, body, { responseType: 'blob' })
  }

  postUrlEncode<T>(path: string, body: object, option?: IApiOption): Observable<T> {
    // const token = btoa(environment.clientId + ':' + environment.clientSecret);
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/x-www-form-urlencoded',
    //   Authorization: 'Basic ' + token,
    // });

    return this.http.post<T>(this.SERVER + path, body)
  }

  put<T>(path: string, body: object, option?: IApiOption): Observable<T> {
    return this.http.put<T>(this.SERVER + path, body, option)
  }

  patch<T>(path: string, body: object, option?: IApiOption): Observable<T> {
    return this.http.patch<T>(this.SERVER + path, body, option)
  }

  delete<T>(path: string, body?: any, option?: IApiOption): Observable<T> {
    return this.http.delete<T>(this.SERVER + path, { body, ...option })
  }
}
