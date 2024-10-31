import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, signal } from '@angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { BreadcrumService, IBreadcrumb } from '../../shared/services/breadcrum.service'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { clearStore } from '../../shared/utilities/system.utils'
import { CommonModule } from '@angular/common'
import { STORAGE_KEYS } from '../../shared/constants/system.const'
import { HeaderService } from './header.service'
import { AuthService } from '../../shared/services/auth.service'

@Component({
  selector: 'app-header-vnaccs',
  standalone: true,
  imports: [
    CommonModule,
    NzBreadCrumbModule,
    NzAvatarModule,
    NzDropDownModule,
    TranslateModule,
    NzLayoutModule,
    RouterModule,
    NzIconModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderVnaccsComponent implements OnInit {
  isLogin: boolean = false
  breadcrums = signal<IBreadcrumb[]>([])
  taxCode: string | null = null

  constructor(
    private router: Router,
    private breadcrumcService: BreadcrumService,
    private headerSrv: HeaderService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.breadcrumcService.breadcrumb$.subscribe((breadcrumbs) => this.breadcrums.set(breadcrumbs))
  }

  ngOnInit(): void {
    this.authService.taxCode$.subscribe((taxCode) => {
      this.taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)
    })
    this.authService.taxCode$.subscribe((taxCode) => {
      this.taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)
      this.cdr.detectChanges()
    })
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLogin = this.authService.getLoginStatus()
      this.cdr.detectChanges()
    })
  }

  getUserInfo(taxCode: string) {
    this.headerSrv.getUserInfo(taxCode).subscribe((res: any) => {
      if (res && res.message === 'success') {
        console.log(res.data)
      }
    })
  }

  logout() {
    clearStore()
    this.authService.setLoginStatus(false)
    this.authService.setTaxCode('')
    localStorage.removeItem(STORAGE_KEYS.TAX_CODE)
    this.router.navigate(['/vnaccs/login'])
  }

  handleClick(option: string) {
    if (option === 'logout') {
      this.logout()
    } else {
      this.router.navigateByUrl('/vnaccs/change-password')
    }
  }
}
