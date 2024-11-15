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
import { RouterLink } from '@angular/router'
import { debounceTime, Subject } from 'rxjs'

@Component({
  selector: 'app-computer',
  templateUrl: './computer.component.html',
  styleUrls: ['./computer.component.scss'],
  standalone: true,
  imports: [NzGridModule, NzInputModule, FormsModule, CommonModule, NzTableModule, NzDividerModule, RouterLink]
})
export class ComputerComponent {
  searchKey!: any
  total: number = 0
  listOfData: any[] = []
  token = localStorage.getItem(STORAGE_KEYS.TOKEN)!
  searchSubject: Subject<string> = new Subject<string>()
  backuplistOfData: any[] = []

  constructor(private accInfoSrv: AccountInformationService) {}
  ngOnInit() {
    this.accInfoSrv.getTerminalAccessKy(this.decodeToken(this.token).sub).subscribe((res: any) => {
      if (res && res.errorCode == 0) {
        this.listOfData = res.data
        this.total = this.listOfData.length
        this.backuplistOfData = res.data
      }
    })

    this.searchSubject
      .pipe(debounceTime(1000)) // Đợi 1 giây sau khi dừng nhập
      .subscribe((searchText) => {
        this.filterList(searchText) // Gọi hàm lọc khi hết thời gian chờ
      })
  }
  onSearch(searchText: string) {
    this.searchSubject.next(searchText)
  }

  filterList(searchText: string) {
    const trimmedSearchText = searchText.toLowerCase().trim()
    if (!trimmedSearchText) {
      // Reset to the original list if search text is empty
      this.listOfData = this.backuplistOfData
    } else {
      const regex = new RegExp(trimmedSearchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      this.listOfData = this.backuplistOfData.filter(
        (data) => regex.test(data.terminalId.toLowerCase()) || regex.test(data.accessKey.toLowerCase())
      )
    }
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
      return decodedPayload
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error)
      return null
    }
  }
}
