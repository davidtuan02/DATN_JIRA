import { Component, Input, SimpleChanges } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { MenuService } from '../../../../shared/services/menu.service'

@Component({
  selector: 'app-default-password',
  templateUrl: './default-password.component.html',
  styleUrls: ['./default-password.component.scss'],
  standalone: true,
  imports: [NzGridModule, RouterLink]
})
export class DefaultPasswordComponent {
  @Input() data!: any
  defaultPassword!: string
  constructor(public menuSrv: MenuService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.defaultPassword = this.data.userIdDefaultPassword
    }
  }
}
