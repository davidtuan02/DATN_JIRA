import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { STORAGE_KEYS } from '../constants/system.const'
import { jwtDecode } from 'jwt-decode'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = new BehaviorSubject<boolean>(false)
  private taxCodeSubject = new BehaviorSubject<string | null>(null)
  taxCode$ = this.taxCodeSubject.asObservable()
  isLoggedIn$ = this.isLoggedIn.asObservable()

  getLoginStatus() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      return true
    }
    return false
  }
  getTaxCode() {
    const taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE) || sessionStorage.getItem(STORAGE_KEYS.TAX_CODE)
    if (taxCode) {
      return taxCode
    }
    return ''
  }
  setLoginStatus(status: boolean) {
    this.isLoggedIn.next(status)
  }

  setTaxCode(taxCode: string) {
    this.taxCodeSubject.next(taxCode) // Notify subscribers
  }

  isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token)
      if (!exp) return true
      return Date.now() >= exp * 1000 // exp là thời gian tính bằng giây, nên cần nhân với 1000
    } catch (error) {
      return true // Nếu có lỗi khi decode, giả sử token đã hết hạn
    }
  }
}
