import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'show-errors',
  templateUrl: './show-errors.component.html',
  styleUrls: ['./show-errors.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class ShowErrorsComponent {
  @Input() feature = '';
  @Input() control: AbstractControl = new FormControl();
  @Input() controlName: string | undefined = '';
  @Input() controlNameCompare: string | undefined = '';

  @Input() value: any = null;
  @Input() minValue: any = null;
  @Input() remnantControlName: string = '';
  @Input() maxLength: string | number|undefined = 0;
  @Input() showErrorPattern = false;
  @Input() showErrorLng = false;
  @Input() showErrorLat = false;
  @Input() showErrorHotline = false;
  @Input() showErrorLandline = false;
  @Input() showErrorPhone = false;
  @Input() showErrorUsername = false;
  @Input() showPatternErrName = '';
  @Input() codeArea!: string;
  @Input() customMessagePattern = '';
  constructor() {
  }


  get getFirstKeyError(): string {
    return (this.control && this.control.errors) ? Object.keys(this.control.errors)[0] : '';
  }

}
