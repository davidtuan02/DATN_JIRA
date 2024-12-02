import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core'
import {NzButtonModule} from 'ng-zorro-antd/button'
import {TranslateModule, TranslateService} from '@ngx-translate/core'
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import {BrowserModule} from '@angular/platform-browser'
import {NzGridModule} from 'ng-zorro-antd/grid'
import {CommonModule} from '@angular/common'
import {NzFormModule} from 'ng-zorro-antd/form'
import {NzInputModule} from 'ng-zorro-antd/input'
import {HeaderVnaccsComponent} from '../../../layouts/header/header.component'
import {FooterVnaccsComponent} from '../../../layouts/footer/footer.component'
import {NzRadioModule} from 'ng-zorro-antd/radio'
import {NzSelectModule} from 'ng-zorro-antd/select'
import {NzModalComponent, NzModalModule} from 'ng-zorro-antd/modal'
import {NzTableModule} from 'ng-zorro-antd/table'
import {LoginService} from './login.service'
import {debounceTime, finalize, Subject} from 'rxjs'
import {STORAGE_KEYS} from '../../../shared/constants/system.const'
import {Router, RouterLink} from '@angular/router'
import {NotificationService} from '../../../shared/services/notification.service'
import {PasswordMaskDirective} from './mask-password.directive'
import {NzMessageService} from 'ng-zorro-antd/message'
import {NzToolTipModule} from 'ng-zorro-antd/tooltip'
import {AuthService} from '../../../shared/services/auth.service'
import * as asn1js from 'asn1js'
import {Certificate} from 'pkijs'
import {AutoTrimDirective} from '../../../shared/directives/trim.directive'
import * as forge from 'node-forge'
import {NzIconModule} from 'ng-zorro-antd/icon'
import {MenuService} from '../../../shared/services/menu.service'
import {MySignService} from "../home/mySignService.service";

declare function initPlugin(comp: any): void

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    NzButtonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    NzGridModule,
    CommonModule,
    NzFormModule,
    NzInputModule,
    NzRadioModule,
    NzSelectModule,
    NzModalComponent,
    NzModalModule,
    NzTableModule,
    NzToolTipModule,
    RouterLink,
    AutoTrimDirective,
    NzIconModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  passwordVisible = false
  radioValue = '1'
  optionFileStatus = [
    {value: 1, label: 'Đang hiển thị'},
    {value: 0, label: 'Đang tắt'}
  ]
  optionFileStatuss = [
    {value: 1, label: 'Đang hiển thị'},
    {value: 0, label: 'Đang tắt'}
  ]
  modalTitle: string = 'Lấy chứng thư số'
  isVisible = false
  isOkLoading = false

  listOfData: any = []

  msAcc: string = ''
  ctsInfo: any = {}

  isVisibleDownload: boolean = false
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign'
  getCTSForm!: FormGroup

  constructor(
    private fb: NonNullableFormBuilder,
    private loginSrv: LoginService,
    private router: Router,
    private notification: NotificationService,
    private message: NzMessageService,
    private authService: AuthService,
    private menuSrv: MenuService,
    private msService: MySignService,
  ) {
    this.loadForm()
  }

  ngOnInit(): void {
  }

  loadForm() {
    this.loginForm = this.fb.group({
      taxCode: ['', [Validators.required]],
      adminPassword: ['', [Validators.required]],
      digitalSignatureType: [null],
      digitalSignature: [''],
      serial: [''],
      provider: [''],
      effectiveDate: [''],
      expiryDate: [''],
      publicKey: [''],
      nameCert: [''],
      credentialId: [''],
      taxCodeCTS: ['']
    })

    this.loginForm.valueChanges.subscribe(() => {
      Object.keys(this.loginForm.controls).forEach((controlName) => {
        const control = this.loginForm.get(controlName)
        if (control?.value && !control.touched) {
          control.markAsTouched()
        }
      })
    })

    this.loginForm.get('digitalSignatureType')?.valueChanges.subscribe((type) => {
      const taxCodeControl = this.loginForm.get('taxCode')

      if (type === '1') {
        taxCodeControl?.setValidators([Validators.required, Validators.pattern(/^\d{0,13}-?\d{0,13}$/)])
      } else if (type === '2') {
        taxCodeControl?.setValidators([Validators.required, Validators.pattern(/^\d{0,13}-?\d{0,13}$/)])
      } else {
        taxCodeControl?.setValidators([Validators.required])
      }

      taxCodeControl?.updateValueAndValidity()
    })

    this.disableForm()
    this.getCTSForm = this.fb.group({
      msAcc: ['', [Validators.required]]
    })

    this.getCTSForm.get('msAcc')?.valueChanges.subscribe((value) => {
      const control = this.getCTSForm.get('msAcc')
      if (!value && control) {
        control.markAsTouched()
        control.updateValueAndValidity()
      }
    })
  }

  disableForm() {
    this.loginForm.get('digitalSignature')?.disable()
    this.loginForm.get('serial')?.disable()
    this.loginForm.get('provider')?.disable()
    this.loginForm.get('effectiveDate')?.disable()
    this.loginForm.get('expiryDate')?.disable()
    this.loginForm.get('publicKey')?.disable()
    this.loginForm.get('nameCert')?.disable()
  }

  onSubmit() {
    this.loginForm.markAllAsTouched()
    const rawFormData = this.loginForm.getRawValue()
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
    if (this.loginForm.invalid) {
      return
    }
    this.login()
  }

  getDigitalSignatureError(): string | undefined {
    const control = this.loginForm.get('digitalSignature')
    if (control?.touched) {
      if (!control.getRawValue()) {
        return 'Tên chứng thư số không được để trống'
      }
    }

    return undefined
  }

  getNameCertError(): string | undefined {
    const control = this.loginForm.get('nameCert')
    if (control?.touched) {
      if (!control.getRawValue()) {
        return 'Tên chứng thư số không được để trống'
      }
    }

    return undefined
  }

  convertDateTimestamp(date: any) {
    const [d, m, y] = date.split(/-|\//) // splits "26-02-2012" or "26/02/2012"
    const dateNew = new Date(y, m - 1, d)
    return dateNew.getTime()
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

  login() {
    const body = {
      taxCode: this.loginForm.value.taxCode,
      adminPassword: this.loginForm.value.adminPassword,
      digitalSignatureType: this.loginForm.value.digitalSignatureType,
      digitalSignature:
        this.radioValue === '1' ? this.loginForm.getRawValue().digitalSignature : this.loginForm.getRawValue().nameCert,
      serial: this.loginForm.getRawValue().serial,
      provider: this.loginForm.getRawValue().provider,
      // provider: this.loginForm.getRawValue().nameCert,
      effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
      expiryDate: this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
      publicKey: this.loginForm.getRawValue().publicKey,
      taxCodeCTS: this.loginForm.value.taxCodeCTS,
      credentialId: this.loginForm.value.credentialId
    }
    let showMsPopup: any;
    if (this.loginForm.get("digitalSignatureType")?.value == 2) {
      showMsPopup = setTimeout(() => {
        this.msService.show();
      }, 1000)
    }
    this.loginSrv.login(body)
      .pipe(
        finalize(() => {
          if (this.loginForm.get("digitalSignatureType")?.value == 2) {
            this.msService.hide()
            clearTimeout(showMsPopup)
          }
        }
      ))
      .subscribe((res: any) => {
        if (res && res.code === 200) {
          this.menuSrv.setSelectedMenu('')
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.result.token)
          sessionStorage.setItem(STORAGE_KEYS.TOKEN, res.result.token)
          this.router.navigate(['vnaccs'])
          localStorage.setItem(STORAGE_KEYS.TAX_CODE, this.loginForm.value.taxCode)
          sessionStorage.setItem(STORAGE_KEYS.TAX_CODE, this.loginForm.value.taxCode)
          this.authService.setLoginStatus(true)
          this.authService.setTaxCode(this.loginForm.value.taxCode)
        }
      })
  }

  onRadioChange(value: any) {
    this.loginForm.get('digitalSignature')?.reset()
    this.loginForm.get('nameCert')?.reset()
    this.loginForm.get('serial')?.reset()
    this.loginForm.get('provider')?.reset()
    this.loginForm.get('effectiveDate')?.reset()
    this.loginForm.get('expiryDate')?.reset()
    this.loginForm.get('publicKey')?.reset()
    this.loginForm.get('credentialId')?.reset()
    this.loginForm.get('taxCodeCTS')?.reset()
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

  getTaxCodeError(): string | undefined {
    const control = this.loginForm.get('taxCode')
    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mã số thuế không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'Mã số thuế không đúng định dạng'
      }
    }
    return undefined
  }

  getPassError(): string | undefined {
    const control = this.loginForm.get('adminPassword')

    const trimmedValue = control?.value?.trim()
    if (control && control.value !== trimmedValue) {
      control.setValue(trimmedValue, {emitEvent: false})
    }

    if ((control?.touched || control?.dirty) && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu không được để trống'
      }
    }

    return undefined
  }

  getMsAccError(): string | undefined {
    const control = this.getCTSForm.get('msAcc')
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Vui lòng nhập tài khoản MySign để lấy chứng thư số'
      }
    }
    return undefined
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

  navigateToDownload(store: string): void {
    if (store === 'appstore') {
      window.open('https://apps.apple.com/vn/app/mysign/id1633019232', '_blank')
    }
    if (store === 'chplay') {
      window.open('https://play.google.com/store/apps/details?id=com.viettel.cloud.ca.mysign&hl=vi', '_blank')
    }
  }

  showModalDownload() {
    this.isVisible = false
    this.isVisibleDownload = true
  }

  handleOk() {
    this.isVisible = false
  }

  handleCancel(): void {
    this.isVisible = false
  }

  handleOkDownload() {
    this.isVisibleDownload = false
    // this.router.navigate(['vnaccs/register']);
  }

  handleCancelDownload(): void {
    this.isVisibleDownload = false
    // this.router.navigate(['vnaccs/register']);
  }

  showModal() {
    this.isVisible = true
    this.getCTSForm.reset()
    this.getCTSForm.markAsUntouched()
    this.listOfData = []
  }

  getCTS() {
    this.getCTSForm.markAllAsTouched()
    if (!this.getCTSForm.invalid) {
      this.loginSrv.getCertInfo(this.getCTSForm.value.msAcc).subscribe((res: any) => {
        if (res && res.message === 'success') {
          this.listOfData = res.data
        }
      })
    } else {
      console.log('Form is invalid!')
    }
  }

  async getVTCAInfo() {
    initPlugin(this)
  }

  applyData(data: any) {
    const currentDate = new Date().getTime()
    const validDate = this.convertComplexDateString(data.validFrom)
    const expireDate = this.convertComplexDateString(data.validTo)
    // console.log('Current Date (timestamp):', currentDate)
    // console.log('Valid Date (timestamp):', validDate)
    // console.log('Expire Date (timestamp):', expireDate)

    if (validDate > currentDate) {
      this.notification.error('Chữ ký số chưa có hiệu lực')
    } else if (expireDate < currentDate) {
      this.notification.error('Chữ ký số đã hết hiệu lực')
    } else {
      this.isVisible = false
      // this.loginForm.get('digitalSignature')?.setValue(data.subjectDN);
      this.loginForm.get('serial')?.setValue(data.serialNumber)
      this.loginForm.get('provider')?.setValue(data.issuerDN)
      this.loginForm.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom))
      this.loginForm.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo))
      this.loginForm.get('nameCert')?.setValue(data.subjectDN)
      this.loginForm.get('publicKey')?.setValue(data.publicKey)
      this.loginForm.get('credentialId')?.setValue(data.credentialId)
      this.loginForm.get('taxCodeCTS')?.setValue(data.subjectDN)
    }
  }

  patchValueToForm(key: string, value: any) {
    if (value) {
      if (key === 'effectiveDate' || key === 'expiryDate') {
        const date = this.formatDateFromString(this.convertDateFormatv2(value))
        this.loginForm.get(key)?.setValue(date)
      } else this.loginForm.get(key)?.setValue(value)
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

  convertDateFormatv2(dateStr: string): string {
    // Parse the input date string in "dd/MM/yyyy HH:mm" format
    const [month, day, year, hour, minute] = dateStr.match(/\d+/g)!.map(Number)

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
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}${timezoneOffset}`
  }

  checkEffectiveDate(input: string) {
    const date = new Date(input).setHours(0, 0, 0, 0);
    const today = new Date().getTime();
    if (date > today) {
      this.notification.error("Chữ ký số chưa có hiệu lực");
      return;
    }
  }

  checkExpiryDate(input: string) {
    const date = new Date(input).setHours(23, 59, 59, 999);
    const today = new Date().getTime();
    if (date < today) {
      this.notification.error("Chữ ký số đã hết hiệu lực");
      return;
    }
  }

  showErrorVTCA() {
    this.notification.error("Có lỗi xảy ra khi nhận diện chữ ký số. Vui lòng thử lại");
    return;
  }
}
