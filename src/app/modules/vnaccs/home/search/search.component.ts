import { Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { DATE_FORMAT } from '../../../../shared/components/common.const'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzSelectModule
  ]
})
export class SearchComponent {
  listOfOptionRegisterType: Array<{ label: string; value: number }> = [
    {
      label: 'Đăng ký mới thông tin doanh nghiệp',
      value: 1
    },
    {
      label: 'Đăng ký thay đổi thông tin doanh nghiệp',
      value: 2
    },
    {
      label: 'Đăng ký thay đổi thông tin tài khoản quản trị',
      value: 3
    }
  ]

  listOfOptionStatus: Array<{ label: string; value: number }> = [
    {
      label: 'Đang nhập liệu',
      value: 1
    },
    {
      label: 'Chờ phê duyệt',
      value: 2
    },
    {
      label: 'Hải quan từ chối',
      value: 3
    },
    {
      label: 'Hải quan chấp nhận',
      value: 4
    }
  ]

  dateFormat = DATE_FORMAT.COMMON

  constructor() {}

  disabledDate = (current: Date): boolean => {
    return current && current > new Date()
  }
}
