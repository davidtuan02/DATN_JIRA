import { ChangeDetectorRef, Component, OnInit, SimpleChange } from '@angular/core'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AccountInformationService } from './account-information.service'
import { NgForOf, NgIf } from '@angular/common'
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid'
import { NzFormDirective } from 'ng-zorro-antd/form'
import { NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective } from 'ng-zorro-antd/input'
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select'
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio'
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs'
import { AdminAccountInfoComponent } from './admin-account-info/admin-account-info.component'
import { AccountInfoComponent } from './account-info/account-register.component'
import { ComputerComponent } from './computer/computer.component'
import { DefaultPasswordComponent } from './default-password/default-password.component'

@Component({
  selector: 'app-account-information',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NzColDirective,
    NzFormDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzOptionComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
    NzRowDirective,
    NzSelectComponent,
    ReactiveFormsModule,
    RouterLink,
    NzTabSetComponent,
    NzTabComponent,
    AdminAccountInfoComponent,
    AccountInfoComponent,
    ComputerComponent,
    DefaultPasswordComponent
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss'
})
export class AccountInformationComponent implements OnInit {
  taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)
  token = localStorage.getItem(STORAGE_KEYS.TOKEN)!
  data!: any

  constructor(private accountInfoService: AccountInformationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const id = this.decodeToken(this.token).sub

    this.accountInfoService.getAdminInfo(id).subscribe((res: any) => {
      if (res && res.errorCode == 0) {
        this.data = res.data
      }
    })
  }

  decodeToken(token: string): any {
    if (!token) {
      return null
    }

    try {
      // Tách phần payload (phần thứ 2 của JWT)
      const base64Url = token.split('.')[1]

      // Xử lý chuỗi Base64Url
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

      // Giải mã Base64 và phân tích JSON
      const decodedPayload = JSON.parse(window.atob(base64))

      // Kiểm tra và lấy phần "sub" trước dấu ";"
      if (decodedPayload.sub) {
        const subValue = decodedPayload.sub.split(';')[1] // Lấy phần đầu tiên trước dấu ";"
        decodedPayload.sub = subValue // Cập nhật lại giá trị "sub"
      }

      // In payload ra console để kiểm tra
      console.log(decodedPayload)

      return decodedPayload
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error)
      return null
    }
  }
}
