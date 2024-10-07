import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { SidebarModel } from '../../shared/models/sidebar.model';
import { SIDE_MENU } from '../../shared/constants/sidebar.const';
import { BreadcrumService } from '../../shared/services/breadcrum.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule,
    NzMenuModule,
    NzLayoutModule,
]
})
export class SidebarComponent implements OnInit, AfterViewInit {
  @Input() isCollapsed!: boolean;
  menus: SidebarModel[] = SIDE_MENU;
  urls!: string;
  hover = false;
  hoveredItem: number | null = null;

  selectedItem: number | null = 0;

  setHoveredItem(index: number | null): void {
    this.hoveredItem = index;
  }

  setClickItem(index: number | null): void {
    this.selectedItem = index;

  }
  menu: any[] = [
    {
      path: 'sth',
      label: 'Quản lí doanh nghiệp',
    },
    {
      path: 'file-manage',
      label: 'Quản lý file',
    },
  ]

  currentRoute: string = '';

  constructor(
    private translate: TranslateService,
    private router: Router,
    private breadcrumb: BreadcrumService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
      this.urls = this.router.url.split('/')[1];
      this.openHandler(this.urls);

      // this.currentRoute = this.router.url;
      // this.router.events.subscribe(() => {
      //   this.currentRoute = this.router.url;
      // });
      // // console.log(this.currentRoute)
      // const arr = this.currentRoute.split('/');
      // if(arr[1] === 'file-manage') {
      //   this.selectedItem = 1;
      // }
      // else {
      //   this.selectedItem = 0;
      // }
  }

  ngAfterViewInit(): void {
      setTimeout(() => {
          this.urls = this.router.url.split('/')[1];
      })
  }

  openHandler(value: string) {
      this.menus = this.menus.map(menu => menu.router === value ? {...menu, open: true} : menu);
  }
}


