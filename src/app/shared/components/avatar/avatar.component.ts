import { Component, Input } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ActionAvatarComponent } from '../action-avatar/avatar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'j-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [
    NzDropDownModule,
    ActionAvatarComponent,
    CommonModule
  ]
})
export class AvatarComponent {
  @Input() avatarUrl!: string;
  @Input() size = 12;
  @Input() name = '';
  @Input() rounded = true;
  @Input() className = '';

  get style() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`,
      'background-image': `url('${this.avatarUrl}')`,
      'border-radius': this.rounded ? '100%' : '3px'
    };
  }
}
