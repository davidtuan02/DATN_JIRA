import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FooterVnaccsComponent } from "./layouts/footer/footer.component";
import { NgxSpinnerModule } from 'ngx-spinner';
import { MainLayoutVnaccsComponent } from './layouts/main-layout/main-layout.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, FooterVnaccsComponent, NgxSpinnerModule, MainLayoutVnaccsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isCollapsed = false;
  language: string = 'vi';
  constructor(
    private translate: TranslateService
  ) {
    this.language = localStorage.getItem('__language') || 'vi';
    localStorage.setItem('__language', this.language);
    this.translate.use(this.language);
  }

}
