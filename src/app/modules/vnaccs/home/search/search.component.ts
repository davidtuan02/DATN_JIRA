import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { CUSTOMER_TABLE_SIZE, DATE_FORMAT, INIT_PAGE, INIT_SIZE } from '../../../../shared/components/common.const'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CommonModule, DatePipe } from '@angular/common'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { RouterLink } from '@angular/router'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { BrowserModule } from '@angular/platform-browser'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { SearchService } from './search.service'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NzFormModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzTableModule,
    NzToolTipModule,
    DatePipe,
    CommonModule,
    NzModalModule,
    RouterLink,
    NzRadioModule,
    NzPaginationModule
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

  // table
  dataTable: any[] = []
  total: number = 0
  paginate = {
    page: INIT_PAGE, //1
    size: INIT_SIZE //10
  }
  paginateStart = 1 // Bắt đầu từ bản ghi nào
  paginateEnd = 10
  // Hàm cập nhật vị trí bản ghi hiển thị khi thay đổi trang
  updatePaginateRange() {
    this.paginateStart = (this.paginate.page - 1) * this.paginate.size + 1
    this.paginateEnd = Math.min(this.paginate.page * this.paginate.size, this.total)
  }
  tableSize = CUSTOMER_TABLE_SIZE
  formatDateTable = DATE_FORMAT.TABLE
  isCollapsed: boolean = false

  checked = false
  indeterminate = false
  setOfCheckedId = new Set<number>()
  listDataSelected: any[] = []
  form!: FormGroup

  constructor(private searchSrv: SearchService, private fb: FormBuilder) {}

  ngOnInit() {
    this.loadForm()
    this.search()
  }

  loadForm() {
    this.form = this.fb.group(
      {
        requestType: [null],
        requestStatus: [null],
        requestNo: [''],
        startDateSubmit: [''],
        endDateSubmit: [''],
        approvalFromDate: [''],
        approvalToDate: ['']
      },
      { Validators: this.validateDate() }
    )
  }

  search() {
    const body = {
      requestType: '',
      requestStatus: 1,
      requestNo: '',
      startDateSubmit: '2025-03-04',
      endDateSubmit: '',
      approvalFromDate: '',
      approvalToDate: '',
      pageSize: 10,
      pageNo: 0
    }
    this.searchSrv.search(39, body).subscribe((res: any) => {
      if (res && res.message === 'success') {
        this.dataTable = res.data.content
        this.total = res.data.totalElements
        console.log(this.dataTable)
      }
    })
  }

  //only for int > 0
  onInput(event: any): void {
    const input = event.target
    input.value = input.value.replace(/[^0-9]/g, '')
  }

  disabledDate = (current: Date): boolean => {
    return current && current > new Date()
  }

  getDisplayRange(): string {
    const start = (this.paginate.page - 1) * this.paginate.size + 1
    const end = Math.min(this.paginate.page * this.paginate.size, this.total)
    return `${start}-${end}`
  }
  pageChange(page: number) {
    this.paginate.page = page
    this.checked = false
    this.indeterminate = false
    // this.search();
  }

  sizeChange(size: number) {
    this.paginate = {
      page: INIT_PAGE,
      size: size
    }
    // this.search();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id)
      const selectedItem = this.dataTable.find((item) => item.id === id)
      if (selectedItem) {
        this.listDataSelected.push(selectedItem)
      }
    } else {
      this.setOfCheckedId.delete(id)
      this.listDataSelected = this.listDataSelected.filter((item) => item.id !== id)
    }
  }

  refreshCheckedStatus(): void {
    const totalItems = this.dataTable.length
    const checkedItems = this.setOfCheckedId.size
    this.checked = totalItems > 0 && checkedItems === totalItems
    this.indeterminate = checkedItems > 0 && checkedItems < totalItems
  }

  onAllChecked(value: boolean): void {
    this.setOfCheckedId.clear()
    this.listDataSelected = []
    this.dataTable.forEach((item) => this.updateCheckedSet(item.id, value))
    this.refreshCheckedStatus()
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked)
    this.refreshCheckedStatus()
  }
}
