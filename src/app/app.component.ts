import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterOutlet } from '@angular/router'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { NgxSpinnerModule } from 'ngx-spinner'
import { TranslateService } from '@ngx-translate/core'
import { NzI18nService, vi_VN, zh_CN } from 'ng-zorro-antd/i18n'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { BoardDndComponent } from './modules/project/board-dnd/board-dnd.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NgxSpinnerModule,
    NzModalModule,
    DragDropModule,
    BoardDndComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isCollapsed = false
  language: string = 'vi'
  constructor(private translate: TranslateService, private i18n: NzI18nService) {
    this.language = localStorage.getItem('__language') || 'vi'
    localStorage.setItem('__language', this.language)
    this.translate.use(this.language)
  }

  ngOnInit() {
  }
}
declare function initPlugin(): void
