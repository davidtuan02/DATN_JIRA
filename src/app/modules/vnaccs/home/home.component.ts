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
  ]
})
export class HomeComponent implements OnInit {
  isLogin: boolean = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private homeSrv: HomeService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLogin = isLoggedIn;
      this.cdr.detectChanges();
    });
  }

  registerAcc() {
          this.router.navigate(['/vnaccs/home/account-register']);

    // this.homeSrv.registerAccountInfo(35, 1).subscribe((res) => {
    //   if (res) {
    //     if (res.message === 'success') {
    //       this.router.navigate(['/vnaccs/home/account-register']);
    //     }
    //   }
    // })
  }
}
