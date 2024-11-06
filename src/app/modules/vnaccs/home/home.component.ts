import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common'
import { HomeService } from './home.service'
import { filter, Subject } from 'rxjs'
import { NzCarouselModule } from 'ng-zorro-antd/carousel'
import { AuthService } from '../../../shared/services/auth.service'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzModalService } from 'ng-zorro-antd/modal'
import { ProvideNewPasswordComponent } from './provide-new-password/provide-new-password.component'
import { NotificationService } from '../../../shared/services/notification.service'

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
  selectedItem: string | null = null

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private homeSrv: HomeService,
    private modalService: NzModalService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLogin = this.authService.getLoginStatus()
      this.cdr.detectChanges()
    })

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects === '/vnaccs/home') {
        this.selectedItem = null
      }
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

  handleNavigate(mode: 'editAcc' | 'editAdminAcc' | 'registerAcc' | 'search' | 'accountInfo') {
    this.selectedItem = mode
    const token: any = localStorage?.getItem(STORAGE_KEYS.TOKEN) || sessionStorage?.getItem(STORAGE_KEYS.TOKEN)
    let decoded: any
    if (token) {
      decoded = this.decodeToken(token)
    }
    if (decoded && decoded.sub) {
      switch (mode) {
        case 'editAcc': {
          this.homeSrv.registerAccountInfo(decoded.sub, 2).subscribe((res: any) => {
            if (res && res.message === 'success') {
              console.log(res.data.id)
              this.router.navigate(['/vnaccs/home/account-update'], {
                state: {
                  data: {
                    id: res.data.id,
                    body: res.data
                  }
                }
              })
            }
          })
          // this.router.navigate(['/vnaccs/home/account-update'])
          break
        }
        case 'editAdminAcc': {
          this.homeSrv.registerAccountInfo(decoded.sub, 3).subscribe((res: any) => {
            if (res && res.message === 'success') {
              // console.log(res.data)
              this.router.navigate(['/vnaccs/home/account-admin-update'], {
                state: {
                  data: res.data,
                  updateStatus: 'first'
                }
              })
            }
          })
          break
        }
        case 'registerAcc': {
          this.homeSrv.registerAccountInfo(decoded.sub, 1).subscribe((res: any) => {
            if (res && res.message === 'success') {
              this.router.navigate(['/vnaccs/home/account-register'])
            }
          })
          // this.router.navigate(['/vnaccs/home/account-register'])
          break
        }
        case 'accountInfo': {
          // console.log(res.data)
          this.router.navigate(['/vnaccs/home/account-information'])
          break
        }
        case 'search': {
          this.router.navigate(['/vnaccs/home/search-custom'])
          break
        }
      }
    }
  }

  onClickNewPassword() {
    const modal = this.modalService.create({
      nzTitle: 'Cấp mới mật khẩu cho người sử dụng',
      nzContent: ProvideNewPasswordComponent,
      nzFooter: null
    })
    modal.afterClose.subscribe((rf) => {
      if (rf) {
        const body = {
          userId: rf.userId,
          password: rf.password
        }
        this.homeSrv.updatePasswordForUserId(body).subscribe((res) => {
          this.notification.success('Đổi mật khẩu cho người dùng thành công')
        })
      }
    })
  }
}
