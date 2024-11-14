import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { STORAGE_KEYS } from '../../../../shared/constants/system.const'
import { AccountInfoService } from '../account-info/account-register.service'
import { AccountInformationService } from '../account-information.service'

@Component({
  selector: 'app-computer',
  templateUrl: './computer.component.html',
  styleUrls: ['./computer.component.scss'],
  standalone: true,
  imports: [NzGridModule, NzInputModule, FormsModule, CommonModule, NzTableModule, NzDividerModule]
})
export class ComputerComponent {
  searchKey!: any
  total: number = 0
  listOfData = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park'
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park'
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park'
    }
  ]
  taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)!

  constructor(private accInfoSrv: AccountInformationService) {}
  ngOnInit() {
    this.accInfoSrv.getTerminalAccessKy(this.taxCode).subscribe((res: any) => {
      if (res && res.success) {
        this.listOfData = res.data
      }
    })
  }
  onSearch(value: any) {}
}
