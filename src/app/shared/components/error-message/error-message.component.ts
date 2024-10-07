import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
})
export class ErrorMessageComponent {
  @Input() formName: AbstractControl = new FormControl();
  @Input() message: any;
  @Input() customMessage: any;
  constructor(private translate: TranslateService) {}

  ngOnInit() {}

  getMessage(error: any) {
    if (error) {
      const key = Object.keys(error);
      if (!key) return '';
      if (key[0] === 'matDatepickerParse') return '';
      if (this.customMessage && this.customMessage[key[0]])
        return this.customMessage[key[0]];

      return ('validation.' + key[0], {
        field: (this.message),
        value: error[key[0]]?.requiredLength ?? '',
      });
    }
  }
}
