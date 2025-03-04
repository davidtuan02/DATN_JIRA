import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'j-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [
    SvgIconComponent,
    CommonModule
  ]
})
export class ButtonComponent {
  @Input() type = 'button';
  @Input() className = 'btn-primary';
  @Input() icon!: string;
  @Input() iconSize = 18;
  @Input() isWorking!: boolean;
  @Input() isActive!: boolean;
  @Input() disabled!: boolean;

  constructor() {}

}
