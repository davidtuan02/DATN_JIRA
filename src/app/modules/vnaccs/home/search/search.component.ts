import { ChangeDetectorRef, Component } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms'
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
import { Router, RouterLink } from '@angular/router'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { BrowserModule } from '@angular/platform-browser'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { SearchService } from './search.service'
import { DialogService } from '../../../../shared/services/dialog.service'
import { ConfirmPopupComponent } from '../../../../shared/components/confirm-popup/confirm-popup.component'

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
  dataTable: any[] = [
    {
      status: 1,
      requestType: '1',
      requestNo: 'REQ001',
      receiptTime: '2024-10-01 12:00',
      requestStatus: '1',
      requestUser: 'Nguyen Van A',
      approvalTime: '2024-10-05 10:00',
      customsDepartmentNote: 'All documents are in order.'
    },
    {
      status: 2,
      requestType: '2',
      requestNo: 'REQ002',
      receiptTime: '2024-10-02 15:30',
      requestStatus: '2',
      requestUser: 'Tran Thi B',
      approvalTime: '2024-10-06 14:30',
      customsDepartmentNote: 'Pending approval from management.'
    },
    {
      status: 3,
      requestType: '3',
      requestNo: 'REQ003',
      receiptTime: '2024-10-03 09:15',
      requestStatus: '3',
      requestUser: 'Le Van C',
      approvalTime: '2024-10-07 11:00',
      customsDepartmentNote: 'Approved and processed.'
    },
    {
      status: 1,
      requestType: '1',
      requestNo: 'REQ004',
      receiptTime: '2024-10-04 11:45',
      requestStatus: '0',
      requestUser: 'Pham Minh D',
      approvalTime: '',
      customsDepartmentNote: 'Request rejected due to missing documents.'
    },
    {
      status: 2,
      requestType: '2',
      requestNo: 'REQ005',
      receiptTime: '2024-10-05 13:00',
      requestStatus: '3',
      requestUser: 'Vu Thi E',
      approvalTime: '2024-10-08 09:00',
      customsDepartmentNote: 'All required approvals obtained.'
    }
  ]
  total: number = 5
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

  constructor(
    private searchSrv: SearchService,
    private fb: FormBuilder,
    private router: Router,
    private dialogSrv: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

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
      { Validators: this.validateDate }
    )
  }

  validateDate: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const startDateSubmit = group.get('startDateSubmit')?.value
    const endDateSubmit = group.get('endDateSubmit')?.value
    const approvalFromDate = group.get('approvalFromDate')?.value
    const approvalToDate = group.get('approvalToDate')?.value

    const errors: ValidationErrors = {}

    if (startDateSubmit && endDateSubmit && new Date(startDateSubmit).getTime() > new Date(endDateSubmit).getTime()) {
      errors['submitInvalidDateRange'] = true
    }

    if (
      approvalFromDate &&
      approvalToDate &&
      new Date(approvalFromDate).getTime() > new Date(approvalToDate).getTime()
    ) {
      errors['approvalInvalidDateRange'] = true
    }

    return Object.keys(errors).length ? errors : null
  }

  getDateSubmitError(): string | undefined {
    const fromDate = this.form.get('startDateSubmit')?.value
    const toDate = this.form.get('endDateSubmit')?.value
    if (fromDate && toDate && new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      return 'Từ ngày phải nhỏ hơn hoặc bằng đến ngày'
    }
    // if (fromDate?.touched && toDate?.touched) {
    //   if (fromDate && toDate && new Date(fromDate).getTime() > new Date(toDate).getTime()) {
    //     return 'loi r'
    //   }
    // }
    return undefined
  }

  getDateApprovalError(): string | undefined {
    const fromDate = this.form.get('approvalFromDate')?.value
    const toDate = this.form.get('approvalToDate')?.value
    if (fromDate && toDate && new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      return 'Từ ngày phải nhỏ hơn hoặc bằng đến ngày'
    }
    return undefined
  }

  handleNavigate(mode: 'detail' | 'custom' | 'edit' | 'delete', data: any) {
    switch (mode) {
      case 'detail': {
        //dang fake k co dang ky tk quan tri
        if (data?.requestType === 1 || data?.requestType === 2) {
          this.router.navigate(['/vnaccs/home/account-detail'], {
            state: {
              data: data
            }
          })
        }
        if (data?.requestType === 3) {
          this.router.navigate(['/vnaccs/home/account-admin-update'], {
            state: {
              data: data
            }
          })
        }
        break
      }
      case 'custom': {
        this.router.navigate(['/vnaccs/home/send-custom'])
        break
      }
      case 'edit': {
        this.router.navigate(['/vnaccs/home/account-update'])
        break
      }
      case 'delete': {
        const dialogData = {
          title: 'Bạn có muốn xóa đề xuất không?'
        }
        const dialogRef = this.dialogSrv.openDialog(ConfirmPopupComponent, '', dialogData, {
          nzClosable: false,
          nzWidth: '400px',
          nzCentered: true,
          nzClassName: 'popup-radius-2'
        })
        dialogRef.afterClose.subscribe((res: any) => {
          if (res) {
            console.log('xoa ok')
            this.cdr.detectChanges()
          }
        })
        break
      }
    }
  }

  search() {
    const body = {
      requestType: '',
      requestStatus: '',
      requestNo: '',
      startDateSubmit: '',
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
