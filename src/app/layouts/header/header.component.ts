import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import {
  BreadcrumService,
  IBreadcrumb,
} from '../../shared/services/breadcrum.service';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { clearStore } from '../../shared/utilities/system.utils';
import { CommonModule } from '@angular/common';
import { STORAGE_KEYS } from '../../shared/constants/system.const';
import { HeaderService } from './header.service';

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
    NzIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderVnaccsComponent implements OnInit{
  isLogin: boolean = false;
  taxCode: string = '';

  breadcrums = signal<IBreadcrumb[]>([]);
  constructor(
    private router: Router,
    private breadcrumcService: BreadcrumService,
    private headerSrv: HeaderService
  ) {
    this.breadcrumcService.breadcrumb$.subscribe(breadcrumbs => this.breadcrums.set(breadcrumbs));
  }

  ngOnInit(): void {
    const token:any =
    localStorage?.getItem(STORAGE_KEYS.TOKEN) ||
    sessionStorage?.getItem(STORAGE_KEYS.TOKEN);
    if(token) {
      this.isLogin = true;
    //   this.getUserInfo('aa');
    }
  }
  getUserInfo(taxCode: string) {
    this.headerSrv.getUserInfo(taxCode).subscribe((res: any) => {
      if(res && res.message === 'success') {
        console.log(res.data)
      }
    })
  }

  logout() {
    clearStore();
    this.router.navigate(['/vnaccs/login']);
  }

  handleClick(option: string) {
    if(option === 'logout') {
      this.logout();
    }
    else {
      this.router.navigateByUrl('/changepass');
    }
  }
}
