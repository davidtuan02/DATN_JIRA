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
import { Router, RouterLink } from '@angular/router'
import { NotificationService } from '../../../shared/services/notification.service'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { AuthService } from '../../../shared/services/auth.service'
import { DialogService } from '../../../shared/services/dialog.service'
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component'
import { ForgotPasswordService } from './forgot-password.service'
import { clearStore } from '../../../shared/utilities/system.utils'
import { AutoTrimDirective } from '../../../shared/directives/trim.directive'
import * as forge from 'node-forge'
declare function initPlugin(comp: any): void

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
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
    NzToolTipModule,
    RouterLink,
    AutoTrimDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ForgotPasswordComponent implements OnInit {
  loginForm!: FormGroup
  passwordVisible = false
  newPasswordVisible = false
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

  listOfData: any = []

  msAcc: string = ''

  isVisibleDownload: boolean = false
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign'

  getCTSForm!: FormGroup

  constructor(
    private fb: NonNullableFormBuilder,
    private notification: NotificationService,
    private forgotSrv: ForgotPasswordService,
    private dialogService: DialogService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadForm()
  }
  ngOnInit(): void {}
  loadForm() {
    this.authService.taxCode$.subscribe((taxCode) => {
      this.loginForm = this.fb.group(
        {
          taxCode: ['', [Validators.required]],
          newPassword: [
            '',
            [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]
          ],
          confirmPassword: ['', [Validators.required]],
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
        },
        { validators: this.passwordMatchValidator.bind(this) }
      )

      this.loginForm.get('digitalSignatureType')?.valueChanges.subscribe((type) => {
        const taxCodeControl = this.loginForm.get('taxCode')

        if (type === '1') {
          taxCodeControl?.setValidators([Validators.pattern(/^\d{10}(-\d{3})?$/)])
        } else if (type === '2') {
          taxCodeControl?.setValidators([Validators.pattern(/^\d{1,13}$/)])
        } else {
          taxCodeControl?.setValidators([Validators.required])
        }

        taxCodeControl?.updateValueAndValidity()
      })

      this.getCTSForm = this.fb.group({
        msAcc: ['', [Validators.required]]
      })

      this.disableForm()
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
    if (this.loginForm.valid) {
      this.forgotPassword()
    } else {
      console.log('Form is invalid!')
    }
  }
  forgotPassword() {
    const dataDialog = {
      title: 'Bạn có muốn lấy lại mật khẩu không?'
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
          taxCode: this.loginForm.value.taxCode,
          newPassword: this.loginForm.value.newPassword,
          confirmNewPassword: this.loginForm.value.confirmPassword,
          digitalSignatureType: this.loginForm.value.digitalSignatureType,
          digitalSignature:
            this.radioValue === '1'
              ? this.loginForm.getRawValue().digitalSignature
              : this.loginForm.getRawValue().nameCert,
          serial: this.loginForm.getRawValue().serial,
          provider: this.loginForm.getRawValue().provider,
          effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
          expiryDate: this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
          publicKey: this.loginForm.getRawValue().publicKey,
          credentialId: this.loginForm.getRawValue().credentialId,
          taxCodeCTS: this.loginForm.getRawValue().taxCodeCTS
        }
        this.forgotSrv.forgotPassword(body).subscribe((res: any) => {
          if (res && res.success) {
            clearStore()
            this.authService.setLoginStatus(false)
            this.router.navigate(['vnaccs/login'])
            this.notification.success('Lấy lại mật khẩu thành công')
          }
        })
      }
    })
  }
  convertDateTimestamp(date: any) {
    const [d, m, y] = date.split(/-|\//) // splits "26-02-2012" or "26/02/2012"
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
      if (control.errors?.['pattern']) {
        return 'Mã số thuế không đúng định dạng'
      }
    }
    return undefined
  }

  getNewPassError() {
    const control = this.loginForm.get('newPassword')
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu mới không được để trống'
      }
      if (control.errors?.['pattern']) {
        return 'Mật khẩu tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      }
    }
    return undefined
  }
  getConfirmPassError(): string | undefined {
    const control = this.loginForm.get('confirmPassword')
    if (control?.touched) {
      if (control.errors?.['required']) {
        return 'Xác nhận lại mật khẩu mới không được để trống'
      }
      if (this.loginForm.errors?.['notmatching']) {
        return 'Xác nhận lại mật khẩu mới phải giống mật khẩu mới đã nhập'
      }
    }
    return undefined
  }
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value
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

  getMsAccError(): string | undefined {
    const control = this.loginForm.get('msAc')
    if (control?.touched) {
      if (control.errors?.['required']) {
        return 'Xác nhận lại mật khẩu mới không được để trống'
      }
    }
    return undefined
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

  showModal() {
    this.isVisible = true
    this.getCTSForm.reset()
    this.getCTSForm.markAsUntouched()
    this.listOfData = []
  }

  getCTS() {
    this.getCTSForm.markAllAsTouched()
    if (!this.getCTSForm.invalid) {
      this.forgotSrv.getCertInfo(this.getCTSForm.value.msAcc).subscribe((res: any) => {
        if (res && res.message === 'success') {
          this.listOfData = res.data
        }
      })
    } else {
      console.log('Form is invalid!')
    }
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

  applyData(data: any) {
    const currentDate = new Date().getTime()
    const validDate = this.convertComplexDateString(data.validFrom)
    const expireDate = this.convertComplexDateString(data.validTo)
    if (validDate > currentDate) {
      this.notification.error('Chữ ký số chưa có hiệu lực')
    } else if (expireDate < currentDate) {
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
      this.loginForm.get('taxCodeCTS')?.setValue(data.subjectDN)
      this.loginForm.get('credentialId')?.setValue(data.credentialId)
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
