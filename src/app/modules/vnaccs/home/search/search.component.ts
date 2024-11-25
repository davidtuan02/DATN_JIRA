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
import { STORAGE_KEYS } from '../../../../shared/constants/system.const'
import { NotificationService } from '../../../../shared/services/notification.service'
import { AutoTrimDirective } from '../../../../shared/directives/trim.directive'
import { NzI18nService, zh_CN } from 'ng-zorro-antd/i18n'
import { NzIconModule } from 'ng-zorro-antd/icon'

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
    NzRadioModule,
    NzPaginationModule,
    AutoTrimDirective,
    NzIconModule
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
      label: 'Hải quan chấp nhận',
      value: 3
    },
    {
      label: 'Hải quan từ chối',
      value: 0
    }
  ]

  dateFormat = DATE_FORMAT.COMMON

  // table
  dataTable: any[] = []
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
    private cdr: ChangeDetectorRef,
    private notification: NotificationService,
    private i18n: NzI18nService
  ) {}

  ngOnInit() {
    this.loadForm()
    this.search()

    // const customPaginationLang = {
    //   ...zh_CN.Pagination,
    //   items_per_page: '/ Trang'
    // }

    // this.i18n.setLocale({
    //   ...zh_CN,
    //   Pagination: customPaginationLang
    // })
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
        if (data?.requestType === 1 || data?.requestType === 2) {
          this.router.navigate(['/vnaccs/home/account-detail'], {
            state: {
              data: {
                ...data,
                customsDepartmentNote: data.customsDepartmentNote,
                approvalTime: data.approvalTime
              }
            }
          })
        }
        if (data?.requestType === 3) {
          this.searchSrv.getInfoAccAdmin(data.id).subscribe(
            (res: any) => {
              if (res && res.errorCode == 0) {
                this.router.navigate(['/vnaccs/home/account-admin-detail'], {
                  state: {
                    data: res.data,
                    requestStatus: data.requestStatus
                  }
                })
              }
            },
            (error: any) => {
              this.search()
            }
          )
        }
        break
      }
      case 'custom': {
        this.router.navigate(['/vnaccs/home/send-custom'], {
          state: {
            data: {
              ...data,
              requestNo: data.requestNo
            }
          }
        })
        break
      }
      case 'edit': {
        if (data?.requestType === 1 || data?.requestType === 2) {
          this.router.navigate(['/vnaccs/home/account-update'], {
            state: {
              data: data
            }
          })
        }
        if (data?.requestType === 3) {
          this.searchSrv.getInfoAccAdmin(data.id).subscribe(
            (res: any) => {
              if (res && res.errorCode == 0) {
                this.router.navigate(['/vnaccs/home/account-admin-update'], {
                  state: {
                    data: res.data
                  }
                })
              }
            },
            (error: any) => {
              this.search()
            }
          )
        }
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
        dialogRef.afterClose.subscribe({
          next: (res: any) => {
            if (res) {
              this.searchSrv.deleteRequest(data.id).subscribe({
                next: (res: any) => {
                  if (res && res.success) {
                    this.notification.success('Xóa đề xuất thành công')
                    this.search()
                  }
                },
                error: (er: any) => {
                  this.notification.error(res.message)
                  console.error(er)
                }
              })
            }
          },
          error: (er: any) => {
            this.search()
          }
        })

        break
      }
    }
  }

  search() {
    const body = {
      requestType: this.form.get('requestType')?.value?.join(';'),
      requestStatus: this.form.get('requestStatus')?.value?.join(';'),
      requestNo: this.form.get('requestNo')?.value,
      startDateSubmit: new Date(this.form.get('startDateSubmit')?.value).getTime(),
      endDateSubmit: new Date(this.form.get('endDateSubmit')?.value).getTime(),
      approvalFromDate: new Date(this.form.get('approvalFromDate')?.value).getTime(),
      approvalToDate: new Date(this.form.get('approvalToDate')?.value).getTime(),
      pageSize: this.paginate.size,
      pageNo: this.paginate.page - 1
    }
    const token: any = localStorage?.getItem(STORAGE_KEYS.TOKEN) || sessionStorage?.getItem(STORAGE_KEYS.TOKEN)
    let decoded: any
    if (token) {
      decoded = this.decodeToken(token)
    }
    this.searchSrv.search(decoded.sub, body).subscribe((res: any) => {
      if (res && res.message === 'success') {
        this.dataTable = res.data.content
        this.total = res.data.totalElements
        console.log(this.dataTable)
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
    this.search()
  }

  sizeChange(size: number) {
    this.paginate = {
      page: INIT_PAGE,
      size: size
    }
    this.search()
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
