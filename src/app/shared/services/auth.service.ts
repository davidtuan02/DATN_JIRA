import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {STORAGE_KEYS} from "../constants/system.const";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private taxCodeSubject = new BehaviorSubject<string | null>(null);
  taxCode$ = this.taxCodeSubject.asObservable();
  isLoggedIn$ = this.isLoggedIn.asObservable();

  getLoginStatus() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      return true;
    }
    return false;
  }
  setLoginStatus(status: boolean) {
    this.isLoggedIn.next(status);
  }

  setTaxCode(taxCode: string) {
    this.taxCodeSubject.next(taxCode); // Notify subscribers
  }
}
