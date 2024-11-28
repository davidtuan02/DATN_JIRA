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
import { AutoTrimDirective } from '../../../../shared/directives/trim.directive'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { INIT_PAGE, INIT_SIZE } from '../../../../shared/components/common.const'

@Component({
  selector: 'app-computer',
  templateUrl: './computer.component.html',
  styleUrls: ['./computer.component.scss'],
  standalone: true,
  imports: [
    NzGridModule,
    NzInputModule,
    FormsModule,
    CommonModule,
    NzTableModule,
    NzDividerModule,
    RouterLink,
    AutoTrimDirective,
    NzPaginationModule
  ]
})
export class ComputerComponent {
  token = localStorage.getItem(STORAGE_KEYS.TOKEN)!
  backuplistOfData: any[] = [] // Dữ liệu gốc từ API
  filteredListOfData: any[] = [] // Dữ liệu sau khi lọc
  listOfData: any[] = [] // Dữ liệu hiển thị trên giao diện
  total: number = 0 // Tổng số dữ liệu (sau khi lọc)
  searchSubject = new Subject<string>()
  searchKey: string = '' // Chuỗi tìm kiếm
  paginate = {
    page: 1, // Trang hiện tại
    size: 10 // Số bản ghi trên mỗi trang
  }

  constructor(private accInfoSrv: AccountInformationService) {}

  ngOnInit() {
    this.accInfoSrv.getTerminalAccessKy(this.decodeToken(this.token).sub).subscribe((res: any) => {
      if (res && res.errorCode == 0) {
        this.backuplistOfData = res.data
        this.filteredListOfData = [...this.backuplistOfData] // Ban đầu, dữ liệu lọc là toàn bộ
        this.total = this.filteredListOfData.length // Tổng số bản ghi sau khi lọc
        this.updatePaginatedData() // Cập nhật trang đầu tiên
      }
    })

    this.searchSubject.pipe(debounceTime(1000)).subscribe((searchText) => {
      this.filterList(searchText) // Gọi hàm lọc sau khi nhập xong
    })
  }

  onSearch(searchText: string): void {
    this.searchKey = searchText // Cập nhật chuỗi tìm kiếm
    this.searchSubject.next(searchText)
  }

  // Hiển thị dữ liệu phù hợp với trang hiện tại
  updatePaginatedData(): void {
    const startIndex = (this.paginate.page - 1) * this.paginate.size
    const endIndex = startIndex + this.paginate.size
    this.listOfData = this.filteredListOfData.slice(startIndex, endIndex)
  }

  // Khi thay đổi trang
  pageChange(newPage: number): void {
    this.paginate.page = newPage // Cập nhật trang hiện tại
    this.updatePaginatedData() // Cập nhật dữ liệu hiển thị
  }

  // Khi thay đổi số lượng mục trên mỗi trang
  sizeChange(newSize: number): void {
    this.paginate.size = newSize // Cập nhật số bản ghi trên mỗi trang
    this.paginate.page = 1 // Reset về trang đầu tiên
    this.updatePaginatedData() // Cập nhật dữ liệu hiển thị
  }

  // Lọc dữ liệu dựa trên chuỗi tìm kiếm
  filterList(searchText: string): void {
    const trimmedSearchText = searchText.toLowerCase().trim()

    if (!trimmedSearchText) {
      // Nếu không có chuỗi tìm kiếm, reset dữ liệu
      this.filteredListOfData = [...this.backuplistOfData]
    } else {
      const regex = new RegExp(trimmedSearchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      this.filteredListOfData = this.backuplistOfData.filter(
        (data) => regex.test(data.terminalId?.toLowerCase() || '') || regex.test(data.accessKey?.toLowerCase() || '')
      )
    }

    // Cập nhật tổng số bản ghi
    this.total = this.filteredListOfData.length

    // Kiểm tra trang hiện tại
    const maxPage = Math.ceil(this.total / this.paginate.size)
    if (this.paginate.page > maxPage) {
      this.paginate.page = 1 // Reset về trang đầu nếu trang hiện tại không hợp lệ
    }

    // Cập nhật dữ liệu hiển thị
    this.updatePaginatedData()
  }

  getDisplayRange(): string {
    const start = (this.paginate.page - 1) * this.paginate.size + 1
    const end = Math.min(this.paginate.page * this.paginate.size, this.total)
    return `${start}-${end}`
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
