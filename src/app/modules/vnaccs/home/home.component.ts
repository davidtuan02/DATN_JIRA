import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HomeService } from './home.service';
import { Subject } from 'rxjs';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { AuthService } from '../../../shared/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { STORAGE_KEYS } from '../../../shared/constants/system.const';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    NzButtonModule,
    TranslateModule,
    CommonModule,
    NzCarouselModule,
    CommonModule,
    RouterModule,
    NzDropDownModule
  ]
})
export class HomeComponent implements OnInit {
  isLogin: boolean = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLogin = isLoggedIn;
      this.cdr.detectChanges();
    });
  }

  decodeToken(token: string): any {
    if (!token) {
      return null;
    }

    try {
      // Tách phần payload (phần thứ 2 của JWT)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(window.atob(base64));

      return decodedPayload;
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null;
    }
  }

  registerAcc() {
    this.router.navigate(['/vnaccs/home/account-register']);
    // const token:any =
    //   localStorage?.getItem(STORAGE_KEYS.TOKEN) ||
    //   sessionStorage?.getItem(STORAGE_KEYS.TOKEN);
    //   if (token) {
    //     const decoded = this.decodeToken(token);
    //     if (decoded && decoded.sub) {
    //       // console.log(decoded)
    //       this.homeSrv.registerAccountInfo(decoded.sub, 1).subscribe((res) => {
    //       if (res) {
    //         if (res.message === 'success') {
    //           this.router.navigate(['/vnaccs/home/account-register']);
    //         }
    //       }
    //     })
    //     }
    // }
  }

  handleNavigate(mode: 'editAcc' | 'editAdminAcc') {
    if (mode === 'editAcc') {
      this.router.navigate(['/vnaccs/home/account-update']);
    }
    else if (mode === 'editAdminAcc') {
      this.router.navigate(['/vnaccs/home/account-admin-update']);
    }
  }
}
