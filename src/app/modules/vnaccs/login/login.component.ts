import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { CommonModule } from '@angular/common'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { HeaderVnaccsComponent } from '../../../layouts/header/header.component'
import { FooterVnaccsComponent } from '../../../layouts/footer/footer.component'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal'
import { NzTableModule } from 'ng-zorro-antd/table'
import { LoginService } from './login.service'
import { Subject } from 'rxjs'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'
import { Router, RouterLink } from '@angular/router'
import { NotificationService } from '../../../shared/services/notification.service'
import { PasswordMaskDirective } from './mask-password.directive'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { AuthService } from '../../../shared/services/auth.service'
import * as asn1js from 'asn1js'
import { Certificate } from 'pkijs'

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
    HeaderVnaccsComponent,
    FooterVnaccsComponent,
    NzRadioModule,
    NzSelectModule,
    NzModalComponent,
    NzModalModule,
    NzTableModule,
    PasswordMaskDirective,
    NzToolTipModule,
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  passwordVisible = false
  radioValue = '1'
  optionFileStatus = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' }
  ]
  optionFileStatuss = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' }
  ]
  modalTitle: string = 'Lấy chứng thư số'
  isVisible = false
  isOkLoading = false

  listOfData: any = []

  msAcc: string = ''
  ctsInfo: any = {}

  isVisibleDownload: boolean = false
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign'

  constructor(
    private fb: NonNullableFormBuilder,
    private loginSrv: LoginService,
    private router: Router,
    private notification: NotificationService,
    private message: NzMessageService,
    private authService: AuthService
  ) {
    this.loadForm()
  }

  ngOnInit(): void {}

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
    this.disableForm()
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
    if (this.loginForm.valid) {
      this.login()
    } else {
      console.log('Form is invalid!')
    }
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

    // Trả về timestamp (số milliseconds từ epoch)
    return dateObj.getTime()
  }

  login() {
    // const body = {
    //   taxCode: this.loginForm.value.taxCode,
    //   adminPassword: this.loginForm.value.adminPassword,
    //   digitalSignatureType: this.loginForm.value.digitalSignatureType,
    //   digitalSignature: this.loginForm.getRawValue().nameCert,
    //   serial: this.loginForm.getRawValue().serial,
    //   provider: this.loginForm.getRawValue().provider,
    //   // provider: this.loginForm.getRawValue().nameCert,
    //   effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
    //   expiryDate: this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
    //   publicKey: this.loginForm.getRawValue().publicKey,
    //   taxCodeCTS: this.loginForm.value.taxCodeCTS,
    //   credentialId: this.loginForm.value.credentialId
    // }
    // this.loginSrv.login(body).subscribe((res: any) => {
    //   if (res && res.code === 200) {
    //     localStorage.setItem(STORAGE_KEYS.TOKEN, res.result.token)
    //     sessionStorage.setItem(STORAGE_KEYS.TOKEN, res.result.token)
    //     this.router.navigate(['vnaccs'])
    //     this.authService.setLoginStatus(true)
    //     this.authService.setTaxCode(this.loginForm.value.taxCode)
    //   }
    // })

    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MCIsImlhdCI6MTczMDM1OTEyNywiZXhwIjoxNzMwNDQ1NTI3fQ.q91dMVaSfX-O2cOIvyOiLelF0bQX_qk91c78oAVsBRGy8bzI3Mr14vZG53Yf85vMU4NmEfMZCR90WIcCuhheUw'
    )
    sessionStorage.setItem(
      STORAGE_KEYS.TOKEN,
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MCIsImlhdCI6MTczMDM1OTEyNywiZXhwIjoxNzMwNDQ1NTI3fQ.q91dMVaSfX-O2cOIvyOiLelF0bQX_qk91c78oAVsBRGy8bzI3Mr14vZG53Yf85vMU4NmEfMZCR90WIcCuhheUw'
    )
    this.router.navigate(['vnaccs'])
    this.authService.setLoginStatus(true)
    localStorage.setItem(STORAGE_KEYS.TAX_CODE, this.loginForm.get('taxCode')?.value)
    sessionStorage.setItem(STORAGE_KEYS.TAX_CODE, this.loginForm.get('taxCode')?.value)
    this.authService.setTaxCode(this.loginForm.get('taxCode')?.value)
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
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mã số thuế không được để trống'
      }
    }
    return undefined
  }

  getPassError(): string | undefined {
    const control = this.loginForm.get('adminPassword')

    const trimmedValue = control?.value?.trim()
    if (control && control.value !== trimmedValue) {
      control.setValue(trimmedValue, { emitEvent: false })
    }

    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu không được để trống'
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

  showModal() {
    this.isVisible = true
    this.msAcc = ''
    this.listOfData = []
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

  getCTS() {
    if (this.msAcc === '') {
      this.notification.error('Vui lòng nhập tài khoản MySign để lấy chứng thư số')
    } else {
      this.loginSrv.getCertInfo(this.msAcc).subscribe((res: any) => {
        if (res) {
          if (res.message === 'success') {
            this.listOfData = res.data
          } else {
            this.notification.error(
              'Có lỗi xảy ra khi kết nối với hệ thống Viettel - MySign. Vui lòng thử lại hoặc liên hệ quản trị viên'
            )
          }
        } else {
          this.notification.error(
            'Có lỗi xảy ra khi kết nối với hệ thống Viettel - MySign. Vui lòng thử lại hoặc liên hệ quản trị viên'
          )
        }
      })
    }
  }

  async getVTCAInfo() {
    // this.vtcaService.getSessionId().subscribe(res => {
    //   this.vtcaService.getCertificate(res).subscribe(rs => {
    //     console.log(rs)
    //   })
    // });
    initPlugin(this)
    setTimeout(() => {
      console.log(this.ctsInfo)
    }, 100)
  }

  applyData(data: any) {
    const currentDate = new Date().getTime()
    const validDate = this.convertComplexDateString(data.validFrom)
    const expireDate = this.convertComplexDateString(data.validTo)
    if (validDate > currentDate) {
      console.log('Chữ ký số chưa có hiệu lực')
      this.notification.error('Chữ ký số chưa có hiệu lực')
    } else if (expireDate < currentDate) {
      console.log('Chữ ký số đã hết hiệu lực')
      this.notification.error('Chữ ký số đã hết hiệu lực')
    } else {
      this.isVisible = false
      // this.loginForm.get('digitalSignature')?.setValue(data.subjectDN);
      this.loginForm.get('serial')?.setValue(data.serialNumber)
      this.loginForm.get('provider')?.setValue(data.issuerDN)
      this.loginForm.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom))
      this.loginForm.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo))
      this.loginForm.get('nameCert')?.setValue(data.subjectDN)
      this.loginForm.get('publicKey')?.setValue(data.subjectDN) //check
      this.loginForm.get('credentialId')?.setValue(data.credentialId)
      this.loginForm.get('taxCodeCTS')?.setValue(data.subjectDN)
      // this.loginForm.enable()
      // this.disableForm();
    }
  }

  patchValueToForm(key: string, value: any) {
    if (value) {
      if (key === 'effectiveDate' || key === 'expiryDate') {
        this.loginForm.get(key)?.setValue(this.formatDateFromString(this.convertDateFormat(value)))
      } else this.loginForm.get(key)?.setValue(value)
    }
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Function to parse the certificate and get the public key
  async getPublicKeyFromCertificate(base64Cert: string): Promise<CryptoKey | null> {
    try {
      const certBuffer = this.base64ToArrayBuffer(base64Cert)

      // Parse ASN.1 structure
      const asn1 = asn1js.fromBER(certBuffer)
      if (asn1.offset === -1) {
        throw new Error('Error parsing certificate ASN.1 structure.')
      }

      // Parse X.509 Certificate
      const certificate = new Certificate({ schema: asn1.result })

      // Get the public key from the certificate
      const publicKey = await certificate.getPublicKey()

      return publicKey
    } catch (error) {
      console.error('Error extracting public key:', error)
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

    return `${yyyy}${MM}${dd}${HH}${mm}${ss}${timezoneOffset}`
  }
}
