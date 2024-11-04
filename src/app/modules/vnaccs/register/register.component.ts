import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { NotificationService } from '../../../shared/services/notification.service'
import { RegisterService } from './register.service'
import { STORAGE_KEYS } from '../../../shared/constants/system.const'
import { DialogService } from '../../../shared/services/dialog.service'
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import * as asn1js from "asn1js";
import {Certificate} from "pkijs";
declare function initPlugin(comp: any): void
import { TrimSpaceDirective } from '../../../shared/directives/trim.directive'

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
    RouterLink,
    NzToolTipModule,
    TrimSpaceDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterComponent implements OnInit {
  loginForm!: FormGroup
  passwordVisible = false
  confirmPasswordVisible = false
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

  msAcc: string = ''

  isVisibleDownload: boolean = false
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign'

  listOfData = [
    {
      serialNumber: 'CT-001',
      subjectDN: '123456789',
      validFrom: '30/10/2024',
      validTo: '01/01/2025'
    },
    {
      serialNumber: 'CT-002',
      subjectDN: '987654321',
      validFrom: '01/02/2022',
      validTo: '01/02/2023'
    },
    {
      serialNumber: 'CT-003',
      subjectDN: '456789123',
      validFrom: '01/03/2022',
      validTo: '01/03/2023'
    },
    {
      serialNumber: 'CT-004',
      subjectDN: '321654987',
      validFrom: '01/04/2022',
      validTo: '01/04/2023'
    },
    {
      serialNumber: 'CT-005',
      subjectDN: '789123456',
      validFrom: '01/05/2022',
      validTo: '01/05/2023'
    }
  ]

  dataToEditOrView: any

  modeScreen!: 'register' | 'update' | 'detail'

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private notification: NotificationService,
    private registerSrv: RegisterService,
    private dialogService: DialogService
  ) {
    this.loadForm()
  }

  ngOnInit(): void {
    const endpoint = this.router.url.split('/').pop() as 'register' | 'account-admin-update' | 'account-admin-detail'
    this.determineMode(endpoint)
  }

  loadForm() {
    this.loginForm = this.fb.group(
      {
        taxCode: ['', [Validators.required]],
        adminPassword: [
          '',
          [
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])([^\s])[A-Za-z\d!@#\$%\^&\*\(\)_\+\-=\[\]{};':"\\|,.<>\/?]{7,}$/
            )
          ]
        ],
        confirmPassword: ['', [Validators.required]],
        email: ['', [Validators.pattern(/^[a-z0-9]+(\.[a-z0-9]+)*@[a-z0-9]+(\.[a-z]{2,})+$/), Validators.required]],
        digitalSignatureType: [this.radioValue],
        digitalSignature: [''],
        serial: [''],
        provider: [''],
        effectiveDate: [''],
        expiryDate: [''],
        publicKey: [''],
        nameCert: [''],
        taxCodeCTS: [''],
        credentialId: ['']
      },
      { validators: this.passwordMatchValidator.bind(this) }
    )

    this.disableForm()
  }

  determineMode(endpoint: string) {
    const state = history.state
    if (state && state.data) {
      // console.log(state.data)
      this.dataToEditOrView = state.data
      // console.log(this.dataToEditOrView)
      if (this.dataToEditOrView) {
        this.applyDataToEditOrView(this.dataToEditOrView)
      }
    }
    switch (endpoint) {
      case 'register': {
        this.modeScreen = 'register'
        break
      }
      case 'account-admin-update': {
        this.modeScreen = 'update'
        this.loginForm.disable()
        this.loginForm.get('email')?.enable()
        this.loginForm.get('signatureType')?.enable()
        break
      }
      case 'account-admin-detail': {
        this.modeScreen = 'detail'
        this.loginForm.disable()
        this.loginForm.get('signatureType')?.enable()
        break
      }
    }
    // console.log(this.modeScreen)
  }

  fromDetailToUpdate() {
    console.log('from detail to edit:' + this.dataToEditOrView)
    this.router.navigate(['/vnaccs/home/account-admin-update'], {
      state: {
        data: this.dataToEditOrView
      }
    })
  }

  sendCustom() {
    this.router.navigate(['/vnaccs/home/send-custom'], {
      state: {
        data: {
          id: this.dataToEditOrView.requestId
        }
      }
    })
  }

  applyDataToEditOrView(data: any) {
    this.loginForm.get('taxCode')?.setValue(data.taxCode)
    this.loginForm.get('email')?.setValue(data.email)
    // this.loginForm.get('digitalSignatureType')?.setValue(data.digitalSignatureType)
    this.radioValue = data.digitalSignatureType.toString()
    this.loginForm.get('digitalSignature')?.setValue(data.digitalSignature)
    this.loginForm.get('serial')?.setValue(data.serial)
    this.loginForm.get('provider')?.setValue(data.provider)
    this.loginForm.get('effectiveDate')?.setValue(this.formatDateToDDMMYYYY(data.effectiveDate))
    this.loginForm.get('expiryDate')?.setValue(this.formatDateToDDMMYYYY(data.expiryDate))
    this.loginForm.get('publicKey')?.setValue(data.publicKey)
    this.loginForm.get('nameCert')?.setValue(data.digitalSignature)
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

  formatDateToDDMMYYYY(dateStr: string) {
    const date = new Date(dateStr)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  onSubmit() {
    this.loginForm.markAllAsTouched()
    if (this.modeScreen === 'update') {
      this.loginForm.get('adminPassword')?.clearValidators()
      this.loginForm.get('adminPassword')?.updateValueAndValidity()
      this.loginForm.get('confirmPassword')?.clearValidators()
      this.loginForm.get('confirmPassword')?.updateValueAndValidity()
    }
    if (this.loginForm.valid) {
      this.registerOrUpdate()
    } else {
      console.log('Form is invalid!')
    }
  }

  registerOrUpdate() {
    const dataDialog = {
      title:
        this.modeScreen === 'update'
          ? 'Bạn có muốn đăng ký thay đổi tài khoản quản trị không?'
          : 'Bạn có muốn đăng ký tài khoản quản trị không?'
    }

    const dialogRef = this.dialogService.openDialog(ConfirmPopupComponent, '', dataDialog, {
      nzClosable: false,
      nzWidth: '400px',
      nzCentered: true,
      nzClassName: 'popup-radius-2'
    })

    dialogRef.afterClose.subscribe((result: boolean) => {
      if (result) {
        if (this.modeScreen === 'update') {
          //update
          const body = {
            taxCode: this.loginForm.getRawValue().taxCode,
            digitalSignatureType: this.loginForm.getRawValue().digitalSignatureType,
            digitalSignature: this.loginForm.getRawValue().digitalSignature,
            serial: this.loginForm.getRawValue().serial,
            provider: this.loginForm.getRawValue().provider,
            effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
            expiryDate: this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
            publicKey: this.loginForm.getRawValue().publicKey,
            email: this.loginForm.getRawValue().email,
            taxCodeCTS: this.loginForm.getRawValue().taxCode
            // credentialId: '001301020532_5181042_20241017083237'
          }
          // console.log(this.dataToEditOrView)
          if (this.dataToEditOrView.requestId) {
            this.registerSrv.update(this.dataToEditOrView.requestId, body).subscribe((res: any) => {
              if (res && res.success) {
                this.router.navigate(['vnaccs/home/search-custom'])
                this.notification.success('Đăng ký thay đổi tài khoản quản trị thành công')
              }
            })
          } else {
            this.registerSrv.updateFirst(this.dataToEditOrView.id, body).subscribe((res: any) => {
              if (res && res.success) {
                this.router.navigate(['vnaccs/home'])
                this.notification.success('Đăng ký thay đổi tài khoản quản trị thành công')
              }
            })
          }
        } else {
          //register
          const body = {
            taxCode: this.loginForm.getRawValue().taxCode,
            adminPassword: this.loginForm.value.adminPassword,
            digitalSignatureType: this.loginForm.value.digitalSignatureType,
            digitalSignature: this.radioValue === '1' ? this.loginForm.getRawValue().digitalSignature : this.loginForm.getRawValue().nameCert,
            serial: this.loginForm.getRawValue().serial,
            provider: this.loginForm.getRawValue().provider,
            effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
            expiryDate: this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
            publicKey: this.loginForm.getRawValue().publicKey,
            email: this.loginForm.value.email,
            taxCodeCTS: this.loginForm.getRawValue().taxCode,
            credentialId: this.loginForm.getRawValue().credentialId
          }
          this.registerSrv.register(body).subscribe((res: any) => {
            if (res && res.message === 'success') {
              this.router.navigate(['vnaccs/home'])
              this.notification.success('Đăng ký tài khoản quản trị thành công')
            }
          })
        }
      }
    })
  }
  convertDateTimestamp(date: any) {
    const [d, m, y] = date.split(/-|\//)
    const dateNew = new Date(y, m - 1, d)
    return dateNew.getTime()
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

  getEmailError(): string | undefined {
    const control = this.loginForm.get('email')
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Email không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'Email không đúng định dạng'
      }
    }
    return undefined
  }

  getPassError() {
    const control = this.loginForm.get('adminPassword')

    const trimmedValue = control?.value?.trim()
    if (control && control.value !== trimmedValue) {
      control.setValue(trimmedValue, { emitEvent: false })
    }

    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'Mật khẩu tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      }
    }
    return undefined
  }

  getConfirmPassError(): string | undefined {
    const control = this.loginForm.get('confirmPassword')

    const trimmedValue = control?.value?.trim()
    if (control && control.value !== trimmedValue) {
      control.setValue(trimmedValue, { emitEvent: false })
    }

    if (control?.touched) {
      if (control.errors?.['required']) {
        return 'Xác nhận lại mật khẩu không được để trống'
      }
      if (this.loginForm.errors?.['notmatching']) {
        return 'Xác nhận lại mật khẩu phải giống mật khẩu đã nhập'
      }
    }
    return undefined
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('adminPassword')?.value
    const confirmPass = group.get('confirmPassword')?.value
    if (pass && confirmPass && pass !== confirmPass) {
      return { notmatching: true }
    }
    return null
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
    console.log('h')

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
    }
    this.registerSrv.getCertInfo(this.msAcc).subscribe((res: any) => {
      if (res && res.message === 'success') {
        this.listOfData = res.data
        // console.log(res)
      } else {
        this.notification.error(
          'Có lỗi xảy ra khi kết nối với hệ thống Viettel - MySign. Vui lòng thử lại hoặc liên hệ quản trị viên'
        )
      }
    })
  }

  convertComplexDateString(dateStr: string): number {
    const isoFormattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(
      8,
      10
    )}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}${dateStr.slice(14)}`

    const dateObj = new Date(isoFormattedDate)

    return dateObj.getTime()
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
      this.loginForm.get('digitalSignature')?.setValue(data.subjectDN)
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
  async getVTCAInfo() {
    initPlugin(this)
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
      const certificate = new Certificate({schema: asn1.result})

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

    return `${yyyy}${dd}${MM}${HH}${mm}${ss}${timezoneOffset}`
  }
}
