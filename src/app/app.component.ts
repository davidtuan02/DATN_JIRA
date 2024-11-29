import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterOutlet } from '@angular/router'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { FooterVnaccsComponent } from './layouts/footer/footer.component'
import { NgxSpinnerModule } from 'ngx-spinner'
import { MainLayoutVnaccsComponent } from './layouts/main-layout/main-layout.component'
import { TranslateService } from '@ngx-translate/core'
import { NzI18nService, vi_VN, zh_CN } from 'ng-zorro-antd/i18n'
import { NzModalComponent, NzModalContentDirective, NzModalModule } from 'ng-zorro-antd/modal'
import { MySignService } from './modules/vnaccs/home/mySignService.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    FooterVnaccsComponent,
    NgxSpinnerModule,
    MainLayoutVnaccsComponent,
    NzModalModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isCollapsed = false
  language: string = 'vi'
  constructor(private translate: TranslateService, private i18n: NzI18nService, public msService: MySignService) {
    this.language = localStorage.getItem('__language') || 'vi'
    localStorage.setItem('__language', this.language)
    this.translate.use(this.language)
  }

  ngOnInit() {
    // const customPaginationLang = {
    //   ...vi_VN.Pagination,
    //   ...vi_VN.Pagination,
    //   items_per_page: '/ Trang'
    // }
    // this.i18n.setLocale({
    //   ...vi_VN,
    //   ...vi_VN,
    //   Pagination: customPaginationLang
    // })
  }
}
declare function initPlugin(): void
