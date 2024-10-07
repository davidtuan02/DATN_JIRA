import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {TranslateModule, TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [
    NzButtonModule,
    TranslateModule
  ]
})
export class WelcomeComponent implements OnInit {

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() { }

}
