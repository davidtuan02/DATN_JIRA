import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common'
import { HomeService } from './home.service'
import { Subject } from 'rxjs'
import { NzCarouselModule } from 'ng-zorro-antd/carousel'
import { AuthService } from '../../../shared/services/auth.service'
import { Router, RouterModule } from '@angular/router'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'

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
  isLogin: boolean = false

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private homeSrv: HomeService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLogin = isLoggedIn
      this.cdr.detectChanges()
    })
  }

  decodeToken(token: string): any {
    if (!token) {
      return null
    }

    try {
      // Tách phần payload (phần thứ 2 của JWT)
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const decodedPayload = JSON.parse(window.atob(base64))

      return decodedPayload
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error)
      return null
    }
  }

  handleNavigate(mode: 'editAcc' | 'editAdminAcc' | 'registerAcc' | 'search') {
    // if (mode === 'editAcc') {
    //   if (this.check(2)) {
    //     this.router.navigate(['/vnaccs/home/account-update'])
    //   }
    // } else if (mode === 'editAdminAcc') {
    //   if (this.check(3)) {
    //     this.router.navigate(['/vnaccs/home/account-admin-update'])
    //   }
    // } else if (mode === 'registerAcc') {
    //   // this.router.navigate(['/vnaccs/home/account-register']);

    //   if (this.check(1)) {
    //     this.router.navigate(['/vnaccs/home/account-register'])
    //   }
    // }

    // this.homeSrv.registerAccountInfo(39, 2).subscribe((res) => {
    //   if (res) {
    //     if (res.message === 'success') {
    //       this.router.navigate(['/vnaccs/home/account-update'], {
    //         state: { data: res.data }
    //       })
    //     }
    //   }
    // })

    this.router.navigate(['/vnaccs/home/search-custom'])
  }
}
