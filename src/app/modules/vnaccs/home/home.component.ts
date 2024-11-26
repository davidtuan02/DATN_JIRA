import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common'
import { HomeService } from './home.service'
import { filter, Subject, Subscription } from 'rxjs'
import { NzCarouselModule } from 'ng-zorro-antd/carousel'
import { AuthService } from '../../../shared/services/auth.service'
import { ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzModalService } from 'ng-zorro-antd/modal'
import { ProvideNewPasswordComponent } from './provide-new-password/provide-new-password.component'
import { NotificationService } from '../../../shared/services/notification.service'
import { CommonService } from '../../../shared/services/common.service'
import { MenuService } from '../../../shared/services/menu.service'

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
  tempSelectedItem: string | null = null
  routerSubscription!: Subscription

  selectedMenu!: String

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private routerr: ActivatedRoute,
    private homeSrv: HomeService,
    private modalService: NzModalService,
    private notification: NotificationService,
    private menuSrv: MenuService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLogin = this.authService.getLoginStatus()
      this.cdr.detectChanges()
    })

    this.menuSrv.selectedMenu$.subscribe((menu: any) => {
      this.selectedItem = menu
      console.log(this.selectedItem)
    })
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
  }

  decodeToken(token: string): any {
    if (!token) {
      return null
    }

    try {
      // Tách phần payload (phần thứ 2 của JWT)
      const base64Url = token.split('.')[1]

      // Xử lý chuỗi Base64Url
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

      // Giải mã Base64 và phân tích JSON
      const decodedPayload = JSON.parse(window.atob(base64))

      // Kiểm tra và lấy phần "sub" trước dấu ";"
      if (decodedPayload.sub) {
        const subValue = decodedPayload.sub.split(';')[1] // Lấy phần đầu tiên trước dấu ";"
        decodedPayload.sub = subValue // Cập nhật lại giá trị "sub"
      }

      return decodedPayload
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error)
      return null
    }
  }

  handleNavigate(mode: 'editAcc' | 'editAdminAcc' | 'registerAcc' | 'search' | 'accountInfo') {
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
              // this.selectedItem = mode
              this.menuSrv.setSelectedMenu(mode)
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
          break
        }
        case 'editAdminAcc': {
          this.homeSrv.registerAccountInfo(decoded.sub, 3).subscribe((res: any) => {
            if (res && res.message === 'success') {
              // this.selectedItem = mode
              this.menuSrv.setSelectedMenu(mode)
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
              // this.selectedItem = mode
              this.menuSrv.setSelectedMenu(mode)
              this.router.navigate(['/vnaccs/home/account-register'])
            }
          })
          break
        }
        case 'accountInfo': {
          // this.selectedItem = mode
          this.menuSrv.setSelectedMenu(mode)
          this.router.navigate(['/vnaccs/home/account-information'])
          break
        }
        case 'search': {
          // this.selectedItem = mode
          this.menuSrv.setSelectedMenu(mode)
          this.router.navigate(['/vnaccs/home/search-custom'])
          break
        }
      }
    }
  }

  onClickNewPassword() {
    const modal = this.modalService.create({
      nzTitle: 'Đổi mật khẩu cho người sử dụng',
      nzContent: ProvideNewPasswordComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzCentered: true,
      nzMaskClosable: false
    })
    modal.afterClose.subscribe((rf) => {
      if (rf) {
        const body = {
          userId: rf.userid,
          newPassword: rf.password,
          confirmNewPassword: rf.rePassword
        }
        this.homeSrv.updatePasswordForUserId(body).subscribe((res) => {
          this.notification.success('Đổi mật khẩu cho người dùng thành công')
        })
      }
    })
  }
}
