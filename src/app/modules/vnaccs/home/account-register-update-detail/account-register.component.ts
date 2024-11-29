import { ChangeDetectorRef, Component } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import {
  CUSTOMER_TABLE_SIZE,
  DATE_FORMAT,
  FILE_STATUS,
  FILE_TYPE,
  INIT_PAGE,
  INIT_SIZE
} from '../../../../shared/components/common.const'
import { NzButtonComponent, NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CommonModule, DatePipe } from '@angular/common'
import { AccountRegisterService } from './account-register.service'
import { NzSelectSizeType } from 'ng-zorro-antd/select'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NotificationService } from '../../../../shared/services/notification.service'
import { DialogService } from '../../../../shared/services/dialog.service'
import { ConfirmPopupComponent } from '../../../../shared/components/confirm-popup/confirm-popup.component'
import { AuthService } from '../../../../shared/services/auth.service'
import { STORAGE_KEYS } from '../../../../shared/constants/system.const'
import { BehaviorSubject, debounceTime, Subject } from 'rxjs'
import * as asn1js from 'asn1js'
import { Certificate } from 'pkijs'
import { AutoTrimDirective } from '../../../../shared/directives/trim.directive'
import * as forge from 'node-forge'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { MenuService } from '../../../../shared/services/menu.service'
import { convertVNStr } from '../../../../shared/utilities/convertVNStr'
// import jwt_decode from 'jwt-decode';
declare function initPlugin(comp: any): void

@Component({
  selector: 'app-account-register',
  templateUrl: './account-register.component.html',
  styleUrls: ['./account-register.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzToolTipModule,
    DatePipe,
    CommonModule,
    NzModalModule,
    RouterLink,
    NzRadioModule,
    AutoTrimDirective,
    NzIconModule
  ]
})
export class AccountRegisterComponent {
  modeScreen: 'register' | 'update' | 'admin-update' | 'detail' = 'register'
  optionRepresent = [
    {
      value: 1,
      label: 'CMND'
    },
    {
      value: 2,
      label: 'CCCD'
    },
    {
      value: 3,
      label: 'Hộ chiếu'
    }
  ]
  dateFormat = DATE_FORMAT.COMMON
  size: NzButtonSize = 'large'
  form!: FormGroup
  formValidateUserId!: FormGroup

  selectedValue = null
  optionFileStatus = FILE_STATUS
  optionFileType = FILE_TYPE

  dataTable: any[] = []
  modalTitleSender: string = 'Thêm mới người khai hải quan'
  modalTitleGetCTS: string = 'Lấy chứng thư số'
  total: number = 0
  paginate = {
    page: INIT_PAGE, //1
    size: INIT_SIZE //10
  }
  paginateStart = 1
  paginateEnd = 10

  tableSize = CUSTOMER_TABLE_SIZE
  formatDateTable = DATE_FORMAT.TABLE
  isCollapsed: boolean = false

  checked = false
  indeterminate = false

  listOfOption: Array<{ label: string; value: number }> = [
    {
      label: 'Vận chuyển',
      value: 1
    },
    {
      label: 'Xuất nhập khẩu',
      value: 2
    }
  ]

  isVisible = false
  isVisibleModalCTS = false
  isVisibleDownload = false
  isOkLoading = false

  radioValue = '1'
  optionFileStatuss = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' }
  ]

  optionPaper = [
    { value: 1, label: 'CMND' },
    { value: 2, label: 'CCCD' },
    { value: 3, label: 'Hộ chiếu' }
  ]
  msAcc: string = ''
  listOfData: any = []
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign'
  taxCode: string | null = null
  searchKey: string = ''
  searchSubject: Subject<string> = new Subject<string>()
  backupDataTable: any[] = []

  setOfCheckedIndex = new Set<number>()
  listDataSelected: any[] = []

  mode: 'view' | 'add' | 'edit' = 'add'
  indexToEdit!: any

  dataFromRouter: any
  getCTSForm!: FormGroup
  initialRadioValue$ = new BehaviorSubject<string | number | null>(null)

  constructor(
    private accReSrv: AccountRegisterService,
    private fb: FormBuilder,
    private notification: NotificationService,
    private dialogService: DialogService,
    private router: Router,
    private authSrv: AuthService,
    private cdr: ChangeDetectorRef,
    private menuSrv: MenuService
  ) {}

  ngOnInit(): void {
    this.loadForm()
    this.loadFormValidateUserId()
    this.authSrv.taxCode$.subscribe((taxCode) => {
      this.taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)
      this.cdr.detectChanges()
    })

    this.searchSubject
      .pipe(debounceTime(1000)) // Đợi 1 giây sau khi dừng nhập
      .subscribe((searchText) => {
        this.filterList(searchText) // Gọi hàm lọc khi hết thời gian chờ
      })

    this.determineScreenMode()
  }

  determineScreenMode() {
    if (this.router.url) {
      const str = this.router.url.split('/').pop() as
        | 'account-register'
        | 'account-update'
        | 'account-admin-update'
        | 'account-detail'
      switch (str) {
        case 'account-register': {
          this.modeScreen = 'register'
          break
        }
        case 'account-update': {
          this.modeScreen = 'update'
          this.menuSrv.setSelectedMenu('search')
          this.getDataToEditAcc()
          this.form.enable()
          this.form.get('numberComputer')?.disable()
          this.form.get('userCode')?.disable()
          break
        }
        case 'account-admin-update': {
          this.modeScreen = 'admin-update'
          // this.menuSrv.setSelectedMenu('search')
          break
        }
        case 'account-detail': {
          this.modeScreen = 'detail'
          this.menuSrv.setSelectedMenu('search')
          this.getDataToEditAcc()
          this.form.disable()
          break
        }
        default: {
          this.modeScreen = 'register'
          break
        }
      }
    }
    // console.log(this.modeScreen)
  }

  responseFromCustom: any
  dataResponse: any
  dataFromSearch: any

  getDataToEditAcc() {
    const state = history.state
    if (state && state.data) {
      this.dataResponse = {
        customsDepartmentNote: state.data.customsDepartmentNote,
        approvalTime: state.data.approvalTime
      }
      // console.log(this.dataResponse)
    }
    if (state && state.data && state.data.id) {
      if (state.data.body) {
        this.responseFromCustom = state.data.requestStatus
        // this.dataFromSearch = state.data
        this.dataFromSearch = state.data.body
        this.form.get('userCode')?.setValue(state.data.body.userCode)
        this.form.get('representativeName')?.setValue(state.data.body.representativeName)
        this.form.get('representativeIdType')?.setValue(state.data.body.representativeIdType)
        this.form.get('representativeIdNo')?.setValue(state.data.body.representativeIdNo)
        this.form.get('address')?.setValue(state.data.body.address)
        this.form.get('fieldOfActivity')?.setValue(state.data.body.fieldOfActivity?.split(';').map(Number))
        this.form.get('proposal')?.setValue(state.data.body.proposal)
        this.form.get('freeSoftware')?.setValue(state.data.body.freeSoftware)
        this.form.get('ediSoftware')?.setValue(state.data.body.ediSoftware)
        this.form.get('numberComputer')?.setValue(state.data.body.numberComputer)
        this.form.get('userCodeExpiryDate')?.setValue(state.data.body.userCodeExpiryDate)
        this.calculateTotal()
        this.dataTable = state.data.body.userIdResponses
      } else {
        this.accReSrv.viewDetailRequestRegister(state.data.id).subscribe((res: any) => {
          if (res && res.message === 'success') {
            this.responseFromCustom = state.data.requestStatus
            // this.dataFromSearch = state.data
            this.dataFromSearch = res.data
            this.form.get('userCode')?.setValue(res?.data?.userCode)
            this.form.get('representativeName')?.setValue(res?.data?.representativeName)
            this.form.get('representativeIdType')?.setValue(res?.data?.representativeIdType)
            this.form.get('representativeIdNo')?.setValue(res?.data?.representativeIdNo)
            this.form.get('address')?.setValue(res?.data?.address)
            this.form.get('fieldOfActivity')?.setValue(res.data.fieldOfActivity?.split(';').map(Number))
            this.form.get('proposal')?.setValue(res?.data?.proposal)
            this.form.get('freeSoftware')?.setValue(res?.data?.freeSoftware)
            this.form.get('ediSoftware')?.setValue(res?.data?.ediSoftware)
            this.form.get('numberComputer')?.setValue(res?.data?.numberComputer)
            this.form.get('userCodeExpiryDate')?.setValue(res?.data?.userCodeExpiryDate)
            this.calculateTotal()
            this.dataTable = res?.data?.requestUserIds
          }
        })
      }
    } else {
      console.log('Không có dữ liệu trong state')
    }
  }

  fromDetailToUpdate() {
    this.router.navigate(['/vnaccs/home/account-update'], {
      state: {
        data: {
          id: this.dataFromSearch.requestId
        }
      }
    })
    this.modeScreen = 'update'
  }

  getResultResponseFromCustom() {
    if (this.responseFromCustom === 2) {
      return 'Chờ phê duyệt'
    }
    if (this.responseFromCustom === 3) {
      return 'Hải quan chấp nhận'
    }
    if (this.responseFromCustom === 0) {
      return 'Hải quan từ chối'
    }
    return ''
  }

  loadForm() {
    this.form = this.fb.group({
      userCode: [''],
      representativeName: ['', [Validators.required]],
      representativeIdType: [2, [Validators.required]],
      representativeIdNo: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]*$')]],
      address: ['', [Validators.required]],
      fieldOfActivity: [null, [Validators.required]],
      proposal: [''],
      freeSoftware: ['0', [Validators.required]],
      ediSoftware: ['0'],
      numberComputer: [0],
      userCodeExpiryDate: ['']
    })

    this.form.valueChanges.subscribe(() => {
      Object.keys(this.form.controls).forEach((controlName) => {
        const control = this.form.get(controlName)
        if (control?.value && !control.touched) {
          control.markAsTouched()
        }
      })
    })

    this.form.get('numberComputer')?.disable()
    this.form.get('userCode')?.disable()

    this.form.get('freeSoftware')?.valueChanges.subscribe(() => {
      this.calculateTotal()
    })
    this.form.get('ediSoftware')?.valueChanges.subscribe(() => {
      this.calculateTotal()
    })
  }

  getStatusItemTable(data: any): string {
    const today = new Date().getTime()
    const effectiveDate = new Date(data?.customsEffectiveDate).getTime()
    const expiryDate = new Date(data?.customsExpiryDate).getTime()
    if (effectiveDate <= today && today < expiryDate) {
      return 'Có hiệu lực'
    } else if (expiryDate < today) {
      return 'Hết hiệu lực'
    } else if (effectiveDate > today) {
      return 'Chưa có hiệu lực'
    } else {
      return ''
    }
  }

  loadFormValidateUserId() {
    this.formValidateUserId = this.fb.group(
      {
        fullName: ['', [Validators.required]],
        userId: [''],
        email: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(\.[a-z0-9]+)*@[a-z0-9]+(\.[a-z]{2,})+$/)]],
        fieldOfActivity: [null, [Validators.required]],
        idType: [null, [Validators.required]],
        idNo: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]*$')]],
        customsEffectiveDate: ['', [Validators.required]],
        customsExpiryDate: ['', [Validators.required]],
        digitalSignatureType: [this.radioValue],
        digitalSignature: ['', [Validators.required]],
        nameCert: ['', [Validators.required]],
        serial: ['', [Validators.required]],
        provider: ['', [Validators.required]],
        effectiveDate: ['', [Validators.required]],
        expiryDate: ['', [Validators.required]],
        publicKey: ['', [Validators.required]],
        credentialId: [''],
        taxCodeCTS: ['']
      },
      {
        validator: this.dateRangeValidator('customsEffectiveDate', 'customsExpiryDate')
      }
    )

    this.formValidateUserId.valueChanges.subscribe(() => {
      Object.keys(this.formValidateUserId.controls).forEach((controlName) => {
        const control = this.formValidateUserId.get(controlName)
        if (control?.value && !control.touched) {
          control.markAsTouched()
        }
      })
    })
  }

  dateRangeValidator(fromDateField: string, toDateField: string) {
    return (formGroup: AbstractControl) => {
      const fromDate = formGroup.get(fromDateField)?.value
      const toDate = formGroup.get(toDateField)?.value

      if (!fromDate || !toDate) {
        return null
      }

      if (new Date(fromDate) > new Date(toDate)) {
        formGroup.get(fromDateField)?.setErrors({ dateRangeInvalid: true })
        formGroup.get(toDateField)?.setErrors({ dateRangeInvalid: true })
      } else {
        formGroup.get(fromDateField)?.setErrors(null)
        formGroup.get(toDateField)?.setErrors(null)
      }
      return null
    }
  }

  getFromDateError(): string | undefined {
    const control = this.formValidateUserId.get('customsEffectiveDate')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Thời gian hiệu lực khai báo hải quan không được để trống'
      }
      if (control.errors?.['dateRangeInvalid']) {
        return 'Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực'
      }
    }
    return undefined
  }

  getExpiryDateValidateError(): string | undefined {
    const control = this.formValidateUserId.get('customsExpiryDate')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Thời gian hết hiệu lực khai báo hải quan không được để trống'
      }
      if (control.errors?.['dateRangeInvalid']) {
        return 'Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực'
      }
    }
    return undefined
  }

  applyData(data: any) {
    const currentDate = new Date().getTime()
    const validDate = this.convertComplexDateString(data.validFrom)
    const expireDate = this.convertComplexDateString(data.validTo)
    if (validDate > currentDate) {
      this.notification.error('Chữ ký số chưa có hiệu lực')
    } else if (expireDate < currentDate) {
      this.notification.error('Chữ ký số đã hết hiệu lực')
    } else {
      this.isVisibleModalCTS = false
      this.formValidateUserId.get('digitalSignature')?.setValue(data.subjectDN)
      // console.log(this.form.getRawValue().digitalSignature)
      this.formValidateUserId.get('serial')?.setValue(data.serialNumber)
      this.formValidateUserId.get('provider')?.setValue(data.issuerDN)
      this.formValidateUserId.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom))
      this.formValidateUserId.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo))
      this.formValidateUserId.get('nameCert')?.setValue(data.subjectDN)
      this.formValidateUserId.get('publicKey')?.setValue(data.publicKey),
        this.formValidateUserId.get('credentialId')?.setValue(data.credentialId)
      this.formValidateUserId.get('taxCodeCTS')?.setValue(data.subjectDN)
    }
  }

  disableForm() {
    this.formValidateUserId.get('digitalSignature')?.disable()
    this.formValidateUserId.get('serial')?.disable()
    this.formValidateUserId.get('provider')?.disable()
    this.formValidateUserId.get('effectiveDate')?.disable()
    this.formValidateUserId.get('expiryDate')?.disable()
    this.formValidateUserId.get('nameCert')?.disable()
    this.formValidateUserId.get('publicKey')?.disable()
  }

  getDigitalSignatureError(): string | undefined {
    const control = this.formValidateUserId.get('digitalSignature')
    if (control?.touched) {
      if (!control.getRawValue()) {
        return 'Tên chứng thư số không được để trống'
      }
    }

    return undefined
  }

  getNameCertError(): string | undefined {
    const control = this.formValidateUserId.get('nameCert')
    if (control?.touched) {
      if (!control.getRawValue()) {
        return 'Tên chứng thư số không được để trống'
      }
    }

    return undefined
  }

  getIdNoValidateError(): string | undefined {
    const control = this.formValidateUserId.get('idNo')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Số CMND/CCCD/Hộ chiếu không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'CMND/CCCD/Hộ chiếu bao gồm chữ hoa, chữ thường, số'
      }
    }

    return undefined
  }

  getFieldOfActivityValidateError(): string | undefined {
    const control = this.formValidateUserId.get('fieldOfActivity')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Lĩnh vực hoạt động không được để trống'
      }
    }

    return undefined
  }

  getIdTypeValidateError(): string | undefined {
    const control = this.formValidateUserId.get('idType')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Loại giấy tờ không được để trống'
      }
    }

    return undefined
  }

  getEmailError(): string | undefined {
    const control = this.formValidateUserId.get('email')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Email không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'Email không đúng định dạng'
      }
    }

    return undefined
  }

  getFullNameError(): string | undefined {
    const control = this.formValidateUserId.get('fullName')
    if (control?.touched || control?.dirty) {
      if (control.errors?.['required']) {
        return 'Họ tên không được để trống'
      }
    }

    return undefined
  }

  submit() {
    this.form.markAllAsTouched()
    if (!this.form.invalid) {
      this.registerOrUpdate()
    } else {
      console.log('Form invalid')
    }
  }

  onSearch(searchText: string) {
    this.searchSubject.next(searchText)
  }

  filterList(searchText: string) {
    const trimmedSearchText = convertVNStr(searchText.toLowerCase().trim())
    if (!trimmedSearchText) {
      this.dataTable = this.backupDataTable
    } else {
      const regex = new RegExp(trimmedSearchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      this.dataTable = this.backupDataTable.filter(
        (data) =>
          regex.test(data.fullName.toLowerCase()) ||
          regex.test(data.idNo.toLowerCase()) ||
          regex.test(data.email.toLowerCase())
      )
    }
  }

  calculateTotal(): void {
    const freeSoftwareValue = +this.form.get('freeSoftware')?.value || 0
    const ediSoftwareValue = +this.form.get('ediSoftware')?.value || 0

    const total = freeSoftwareValue + ediSoftwareValue

    this.form.get('numberComputer')?.setValue(total.toLocaleString('de-DE'))
  }

  getFieldOfActivityError(): string | undefined {
    const control = this.form.get('fieldOfActivity')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Lĩnh vực hoạt động không được để trống'
      }
    }

    return undefined
  }

  getRepresentativeError(): string | undefined {
    const control = this.form.get('representativeName')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Tên người đại diện không được để trống'
      }
    }

    return undefined
  }

  getRepresentativeTypeError(): string | undefined {
    const control = this.form.get('representativeIdType')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Loại giấy tờ người đại diện không được để trống'
      }
    }

    return undefined
  }

  getIdNoError(): string | undefined {
    const control = this.form.get('representativeIdNo')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Số CMND/CCCD/ Hộ chiếu không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'Số CMND/CCCD/Hộ chiếu bao gồm chữ hoa, chữ thường, số'
      }
    }

    return undefined
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode
    const inputElement = event.target as HTMLInputElement
    const currentValue = inputElement.value

    if ((charCode >= 48 && charCode <= 57) || charCode === 8 || charCode === 46) {
      return true
    }
    event.preventDefault()
    return false
  }

  formatNumber(event: Event, controlName: 'freeSoftware' | 'ediSoftware'): void {
    const inputElement = event.target as HTMLInputElement
    let inputValue = inputElement.value

    inputValue = inputValue.replace(/\./g, '')

    let numericValue = parseInt(inputValue, 10)
    if (isNaN(numericValue)) {
      numericValue = 0
    }

    this.form.get(controlName)?.setValue(numericValue)

    inputElement.value = numericValue.toLocaleString('de-DE')

    this.calculateTotal()
  }

  setDefaultValue(controlName: 'freeSoftware' | 'ediSoftware'): void {
    const currentValue = this.form.get(controlName)?.value

    // Set default to "0" if the field is empty or contains only zeros
    if (!currentValue || currentValue === '0' || currentValue === '0.') {
      this.form.get(controlName)?.setValue('0')
    }
    this.calculateTotal()
  }

  //allow Aa-Za, 0-9
  allowAlphaNumeric(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode
    if (
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122) ||
      (charCode >= 48 && charCode <= 57) ||
      charCode === 8
    ) {
      return true
    }
    event.preventDefault()
    return false
  }

  getBusinessAddressError(): string | undefined {
    const control = this.form.get('address')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Địa chỉ doanh  nghiệp không được để trống'
      }
    }

    return undefined
  }

  showModalUserId(mode: 'add' | 'view' | 'edit', data: any, index: any) {
    this.isVisible = true
    this.getCTSForm = this.fb.group({
      msAcc: ['', [Validators.required]]
    })
    this.getCTSForm.valueChanges.subscribe(() => {
      Object.keys(this.getCTSForm.controls).forEach((controlName) => {
        const control = this.getCTSForm.get(controlName)
        if (control?.value && !control.touched) {
          control.markAsTouched()
        }
      })
    })
    this.getCTSForm.get('msAcc')?.valueChanges.subscribe((value) => {
      const control = this.getCTSForm.get('msAcc')
      if (!value && control && control.touched) {
        control.markAsTouched()
        control.updateValueAndValidity()
      }
    })
    this.formValidateUserId.reset()
    this.formValidateUserId.enable()

    if (mode === 'add') {
      this.modalTitleSender = 'Thêm mới người khai hải quan'
      this.mode = 'add'
      this.formValidateUserId.reset()
      this.formValidateUserId.get('idType')?.setValue(2)
      this.disableForm()
    }
    if (mode === 'edit') {
      this.modalTitleSender = 'Chỉnh sửa người khai hải quan'
      this.mode = 'edit'
      this.formValidateUserId.reset()
      this.indexToEdit = index
      //apply data
      this.setValueForm(data)
      this.disableForm()
      this.formValidateUserId.get('userId')?.disable()
    }
    if (mode === 'view') {
      this.modalTitleSender = 'Xem chi tiết người khai hải quan'
      this.mode = 'view'
      this.formValidateUserId.reset()
      //appy data
      this.setValueForm(data)
      this.formValidateUserId.disable()
    }
  }

  setValueForm(data: any) {
    this.formValidateUserId.get('fullName')?.setValue(data?.fullName)
    this.formValidateUserId.get('userId')?.setValue(data?.userId)
    this.formValidateUserId.get('email')?.setValue(data?.email)
    this.formValidateUserId.get('fieldOfActivity')?.setValue(data?.fieldOfActivity?.split(';').map(Number))
    this.formValidateUserId.get('idType')?.setValue(data?.idType)
    this.formValidateUserId.get('idNo')?.setValue(data?.idNo)
    this.formValidateUserId.get('customsEffectiveDate')?.setValue(data?.customsEffectiveDate)
    this.formValidateUserId.get('customsExpiryDate')?.setValue(data?.customsExpiryDate)
    this.radioValue = data?.digitalSignatureType?.toString()
    if (this.radioValue === '1') {
      this.formValidateUserId.get('digitalSignature')?.setValue(data?.digitalSignature)
    } else if (this.radioValue === '2') {
      this.formValidateUserId.get('nameCert')?.setValue(data?.digitalSignature)
    }
    this.formValidateUserId.get('serial')?.setValue(data?.serial)
    this.formValidateUserId.get('provider')?.setValue(data?.provider)
    this.formValidateUserId.get('effectiveDate')?.setValue(this.convertTimestampToDate(data?.effectiveDate))
    this.formValidateUserId.get('expiryDate')?.setValue(this.convertTimestampToDate(data?.expiryDate))
    this.formValidateUserId.get('publicKey')?.setValue(data?.publicKey)
    this.formValidateUserId.get('credentialId')?.setValue(data?.credentialId)
    this.formValidateUserId.get('taxCodeCTS')?.setValue(data?.taxCodeCTS)

    this.initialRadioValue$.next(this.radioValue)
  }

  submitValidateUserId() {
    this.formValidateUserId.markAllAsTouched()
    const rawFormData = this.formValidateUserId.getRawValue()
    if (
      (!rawFormData.digitalSignature && !rawFormData.nameCert) ||
      !rawFormData.serial ||
      !rawFormData.provider ||
      !rawFormData.effectiveDate ||
      !rawFormData.expiryDate ||
      !rawFormData.publicKey
    ) {
      return
    }
    if (!this.formValidateUserId.invalid) {
      if (this.mode === 'add') {
        this.validateUserId()
      } else if (this.mode === 'edit') {
        //edit
        this.editUserId()
      }
    } else {
      console.log('Form invalid')
    }
  }

  handleCancel() {
    this.isVisible = false
  }

  showModalCTS() {
    this.isVisibleModalCTS = true
    this.getCTSForm.reset()
    this.listOfData = []
  }

  handleCancelCTS() {
    this.isVisibleModalCTS = false
  }

  showModalDownload() {
    this.isVisibleModalCTS = false
    this.isVisibleDownload = true
  }

  handleCancelDownload() {
    this.isVisibleDownload = false
  }

  onRadioChange(value: any) {
    const initialValue = this.initialRadioValue$.getValue()
    if (initialValue != value) {
      this.formValidateUserId.get('digitalSignature')?.reset()
      this.formValidateUserId.get('serial')?.reset()
      this.formValidateUserId.get('provider')?.reset()
      this.formValidateUserId.get('effectiveDate')?.reset()
      this.formValidateUserId.get('expiryDate')?.reset()
      this.formValidateUserId.get('publicKey')?.reset()
      this.formValidateUserId.get('nameCert')?.reset()
      this.formValidateUserId.get('taxCodeCTS')?.reset()
      this.formValidateUserId.get('credentialId')?.reset()
    }
  }

  editUserId() {
    const body = {
      userId: this.formValidateUserId.getRawValue().userId,
      fullName: this.formValidateUserId.getRawValue().fullName,
      email: this.formValidateUserId.getRawValue().email,
      idType: this.formValidateUserId.getRawValue().idType,
      idNo: this.formValidateUserId.getRawValue().idNo,
      fieldOfActivity: this.formValidateUserId.getRawValue().fieldOfActivity?.join(';'),
      customsEffectiveDate: this.formValidateUserId.getRawValue().customsEffectiveDate,
      customsExpiryDate: this.formValidateUserId.getRawValue().customsExpiryDate,

      digitalSignatureType: this.formValidateUserId.getRawValue().digitalSignatureType,
      digitalSignature:
        this.radioValue === '1'
          ? this.formValidateUserId.getRawValue().digitalSignature
          : this.formValidateUserId.getRawValue().nameCert,
      serial: this.formValidateUserId.getRawValue().serial,
      provider: this.formValidateUserId.getRawValue().provider,
      effectiveDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().effectiveDate),
      expiryDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().expiryDate),
      publicKey: this.formValidateUserId.getRawValue().publicKey,
      credentialId: this.formValidateUserId.getRawValue().credentialId,
      taxCodeCTS: this.formValidateUserId.getRawValue().taxCodeCTS
    }
    this.accReSrv.checkRegisterUserId(body).subscribe((res: any) => {
      if (res) {
        console.log(res)
        this.dataTable = this.dataTable.map((ele: any, index: any) => {
          if (index !== this.indexToEdit) {
            return ele
          } else {
            return body
          }
        })

        this.isVisible = false
        this.cdr.detectChanges()
      }
    })
  }

  validateUserId() {
    const body = {
      userId: this.formValidateUserId.getRawValue().userId,
      fullName: this.formValidateUserId.getRawValue().fullName,
      email: this.formValidateUserId.getRawValue().email,
      idType: this.formValidateUserId.getRawValue().idType,
      idNo: this.formValidateUserId.getRawValue().idNo,
      fieldOfActivity: this.formValidateUserId.getRawValue().fieldOfActivity?.join(';'),
      customsEffectiveDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().customsEffectiveDate),
      customsExpiryDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().customsExpiryDate),
      digitalSignatureType: this.formValidateUserId.getRawValue().digitalSignatureType,
      digitalSignature:
        this.radioValue === '1'
          ? this.formValidateUserId.getRawValue().digitalSignature
          : this.formValidateUserId.getRawValue().nameCert,
      serial: this.formValidateUserId.getRawValue().serial,
      provider: this.formValidateUserId.getRawValue().provider,
      effectiveDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().effectiveDate),
      expiryDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().expiryDate),
      publicKey: this.formValidateUserId.getRawValue().publicKey,
      taxCodeCTS: this.formValidateUserId.getRawValue().taxCodeCTS,
      credentialId: this.formValidateUserId.getRawValue().credentialId
    }

    this.accReSrv.checkRegisterUserId(body).subscribe((res: any) => {
      if (res) {
        if (res.success) {
          this.isVisible = false
          //add data to table
          this.dataTable = [...this.dataTable, body]
          console.log(this.dataTable)
          this.backupDataTable = this.dataTable
          this.cdr.detectChanges()
        }
      }
    })
  }

  getMsAccError(): string | undefined {
    const control = this.getCTSForm.get('msAcc')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Vui lòng nhập tài khoản MySign để lấy chứng thư số'
      }
    }
    return undefined
  }

  getCTS() {
    this.getCTSForm.markAllAsTouched()
    if (!this.getCTSForm.invalid) {
      this.accReSrv.getCertInfo(this.getCTSForm.value.msAcc).subscribe((res: any) => {
        if (res && res.message === 'success') {
          this.listOfData = res.data
        }
      })
    } else {
      console.log('Form is invalid!')
    }
  }

  formatDateFromString = (dateString: string): string | null => {
    if (dateString.length < 8) {
      return null
    }
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)

    const date = new Date(`${year}-${month}-${day}`)

    if (isNaN(date.getTime())) {
      return null
    }

    return `${day}/${month}/${year}`
  }

  convertComplexDateString(dateStr: string): number {
    // Chuyển chuỗi 'YYYYMMDDHHmmss±zzzz' thành định dạng ISO 8601
    const isoFormattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(
      8,
      10
    )}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}${dateStr.slice(14)}`

    // Tạo đối tượng Date từ chuỗi đã định dạng
    const dateObj = new Date(isoFormattedDate)

    // Kiểm tra xem đối tượng Date có hợp lệ không
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid Date format:', dateStr)
      return 0 // Trả về 0 nếu ngày không hợp lệ
    }

    // Trả về timestamp (số milliseconds từ epoch)
    return dateObj.getTime()
  }

  convertDateTimestamp(date: any) {
    if (typeof date === 'string') {
      const [d, m, y] = date.split(/-|\//)
      const dateNew = new Date(Number(y), Number(m) - 1, Number(d))
      return dateNew.getTime()
    } else if (date instanceof Date) {
      return date.getTime()
    } else {
      throw new Error('Invalid date format')
    }
  }

  convertTimestampToDate = (timestamp: number): string => {
    const date = new Date(timestamp)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  convertDateToTimestamp = (dateString: string): number => {
    // Split the string into day, month, and year
    const [day, month, year] = dateString.split('/').map(Number)

    // Create a new Date object (months are 0-based, so subtract 1 from the month)
    const date = new Date(year, month - 1, day)

    // Return the timestamp (milliseconds since epoch)
    return date.getTime()
  }

  navigateToDownload(store: string): void {
    if (store === 'appstore') {
      window.open('https://apps.apple.com/vn/app/mysign/id1633019232', '_blank')
    }
    if (store === 'chplay') {
      window.open('https://play.google.com/store/apps/details?id=com.viettel.cloud.ca.mysign&hl=vi', '_blank')
    }
  }

  copyText(): void {
    const inputElement = document.getElementById('copyInput') as HTMLInputElement
    if (inputElement) {
      inputElement.select()
      inputElement.setSelectionRange(0, 99999)
      document.execCommand('copy')
      this.notification.success('Đã sao chép đường dẫn')
    }
  }

  handleOkDownload() {
    this.isVisibleDownload = false
    // this.router.navigate(['vnaccs/register']);
  }

  updatePaginateRange() {
    this.paginateStart = (this.paginate.page - 1) * this.paginate.size + 1
    this.paginateEnd = Math.min(this.paginate.page * this.paginate.size, this.total)
  }

  disabledDate = (current: Date): boolean => {
    return current && current < new Date()
  }

  pageChange(page: number) {
    this.paginate.page = page
    this.checked = false
    this.indeterminate = false
  }

  sizeChange(size: number) {
    this.paginate = {
      page: INIT_PAGE,
      size: size
    }
  }

  updateCheckedSet(index: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedIndex.add(index)
      const selectedItem = this.dataTable[index]
      if (selectedItem) {
        this.listDataSelected.push(selectedItem)
      }
    } else {
      this.setOfCheckedIndex.delete(index)
      this.listDataSelected = this.listDataSelected.filter((_, i) => i !== index)
    }
  }

  refreshCheckedStatus(): void {
    const totalItems = this.dataTable.length
    const checkedItems = this.setOfCheckedIndex.size
    this.checked = totalItems > 0 && checkedItems === totalItems
    this.indeterminate = checkedItems > 0 && checkedItems < totalItems
  }

  onAllChecked(value: boolean): void {
    this.setOfCheckedIndex.clear()
    this.listDataSelected = []
    this.dataTable.forEach((_, index) => this.updateCheckedSet(index, value))
    this.refreshCheckedStatus()
  }

  onItemChecked(index: number, checked: boolean): void {
    this.updateCheckedSet(index, checked)
    this.refreshCheckedStatus()
  }

  deleteMany() {
    console.log(this.listDataSelected)
    const dataDialog = {
      title: 'Bạn có muốn xoá User ID đã chọn không?'
    }

    const dialogRef = this.dialogService.openDialog(ConfirmPopupComponent, '', dataDialog, {
      nzClosable: false,
      nzWidth: '400px',
      nzCentered: true,
      nzClassName: 'popup-radius-2'
    })
    dialogRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.dataTable = this.dataTable.filter((_, index) => !this.setOfCheckedIndex.has(index))
        this.setOfCheckedIndex.clear()
        this.listDataSelected = []
        this.refreshCheckedStatus()
      }
    })
  }

  deleteItem(index: number): void {
    const dataDialog = {
      title: 'Bạn có muốn xoá User ID đã chọn không?'
    }

    const dialogRef = this.dialogService.openDialog(ConfirmPopupComponent, '', dataDialog, {
      nzClosable: false,
      nzWidth: '400px',
      nzCentered: true,
      nzClassName: 'popup-radius-2'
    })
    dialogRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.dataTable.splice(index, 1)
        this.setOfCheckedIndex.delete(index)
        this.listDataSelected = this.listDataSelected.filter((_, i) => i !== index)
        this.refreshCheckedStatus()
      }
    })
  }

  registerOrUpdate() {
    const dataDialog = {
      title:
        this.modeScreen === 'register'
          ? 'Bạn có muốn đăng ký mới thông tin doanh nghiệp không?'
          : 'Bạn có muốn đăng ký thay đổi thông tin doanh nghiệp không?'
    }

    const dialogRef = this.dialogService.openDialog(ConfirmPopupComponent, '', dataDialog, {
      nzClosable: false,
      nzWidth: '400px',
      nzCentered: true,
      nzClassName: 'popup-radius-2'
    })

    dialogRef.afterClose.subscribe((result: boolean) => {
      if (result) {
        const body = {
          taxCode: this.taxCode,
          representativeName: this.form.getRawValue().representativeName,
          representativeIdType: this.form.getRawValue().representativeIdType,
          representativeIdNo: this.form.getRawValue().representativeIdNo,
          address: this.form.getRawValue().address,
          fieldOfActivity: this.form.getRawValue().fieldOfActivity?.join(';'),
          proposal: this.form.getRawValue().proposal,
          userCode: this.form.getRawValue().userCode,
          freeSoftware: this.form.getRawValue().freeSoftware,
          ediSoftware: this.form.getRawValue().ediSoftware,
          edifactSoftware: this.form.getRawValue().ediSoftware,
          userCodeExpiryDate: new Date(this.form.getRawValue().userCodeExpiryDate).getTime(),
          userIdRequestList: this.dataTable
        }

        //get ID from token
        const token: any = localStorage?.getItem(STORAGE_KEYS.TOKEN) || sessionStorage?.getItem(STORAGE_KEYS.TOKEN)
        if (token) {
          const decoded = this.decodeToken(token)
          if (decoded && decoded.sub) {
            if (this.modeScreen === 'register') {
              this.accReSrv.register(decoded.sub, body).subscribe((res: any) => {
                if (res) {
                  if (res.success) {
                    this.notification.success(res.message)
                    this.router.navigate(['/vnaccs/home/search-custom'])
                    this.menuSrv.setSelectedMenu('search')
                  }
                }
              })
            } else if (this.modeScreen === 'update') {
              if (this.dataFromSearch.requestId) {
                this.accReSrv.update(this.dataFromSearch.requestId, body).subscribe((res: any) => {
                  if (res) {
                    if (res.success) {
                      this.notification.success(res.message)
                      this.router.navigate(['/vnaccs/home/search-custom'])
                      this.menuSrv.setSelectedMenu('search')
                    }
                  }
                })
              } else {
                //update first
                this.accReSrv.edit(decoded.sub, body).subscribe((res: any) => {
                  if (res) {
                    if (res.success) {
                      this.notification.success(res.message)
                      this.router.navigate(['/vnaccs/home/search-custom'])
                      this.menuSrv.setSelectedMenu('search')
                    }
                  }
                })
              }
            }
          }
        }
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

  async getVTCAInfo() {
    initPlugin(this)
  }

  patchValueToForm(key: string, value: any) {
    if (value) {
      if (key === 'effectiveDate' || key === 'expiryDate') {
        this.formValidateUserId.get(key)?.setValue(this.formatDateFromString(this.convertDateFormat(value)))
      } else this.formValidateUserId.get(key)?.setValue(value)
    }
  }

  // Function to parse the certificate and get the public key
  async getPublicKeyFromCertificate(base64Cert: string): Promise<any> {
    try {
      // Decode the base64-encoded certificate to DER format
      const certDer = forge.util.decode64(base64Cert)
      const certAsn1 = forge.asn1.fromDer(certDer)
      const certificate = forge.pki.certificateFromAsn1(certAsn1)

      // Get the public key
      const publicKey = certificate.publicKey
      return publicKey
    } catch (error) {
      console.error('Error extracting public key with node-forge:', error)
      return null
    }
  }

  convertDateFormat(dateStr: string): string {
    // Parse the input date string in "dd/MM/yyyy HH:mm" format
    const [day, month, year, hour, minute] = dateStr.match(/\d+/g)!.map(Number)

    // Create a Date object
    const date = new Date(year, month - 1, day, hour, minute)

    // Format the date as "yyyyMMddHHmmss+0700"
    const yyyy = date.getFullYear().toString()
    const MM = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')
    const HH = date.getHours().toString().padStart(2, '0')
    const mm = date.getMinutes().toString().padStart(2, '0')
    const ss = date.getSeconds().toString().padStart(2, '0')

    // Append the timezone offset in the "+0700" format
    const timezoneOffset = '+0700' // adjust if necessary

    return `${yyyy}${dd}${MM}${HH}${mm}${ss}${timezoneOffset}`
  }
}
