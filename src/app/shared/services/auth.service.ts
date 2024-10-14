import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private taxCodeSubject = new BehaviorSubject<string | null>(null);
  taxCode$ = this.taxCodeSubject.asObservable();
  isLoggedIn$ = this.isLoggedIn.asObservable();

  setLoginStatus(status: boolean) {
    this.isLoggedIn.next(status);
  }

  setTaxCode(taxCode: string) {
    this.taxCodeSubject.next(taxCode); // Notify subscribers
  }
}
