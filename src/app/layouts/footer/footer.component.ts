import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-footer-vnaccs',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    TranslateModule
  ]
})
export class FooterVnaccsComponent {

  constructor(
    private translate: TranslateService
  ) { }
}
