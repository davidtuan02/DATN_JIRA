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
import { NzGridModule } from 'ng-zorro-antd/grid'
import { CommonModule } from '@angular/common'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
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
import { UpdateSignatureService } from './update-signature.service'
import { clearStore } from '../../../shared/utilities/system.utils'
import { AutoTrimDirective } from '../../../shared/directives/trim.directive'
import * as forge from 'node-forge'
import { EMAIL_REGEX } from '../../../shared/constants/regex.const'
import { NzIconModule } from 'ng-zorro-antd/icon'

declare function initPlugin(comp: any): void
@Component({
  selector: 'app-update-signature',
  standalone: true,
  templateUrl: './update-signature.component.html',
  styleUrls: ['./update-signature.component.scss'],
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
export class UpdateSignatureComponent implements OnInit {
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
    private dialogService: DialogService,
    private authService: AuthService,
    private updateSignatureSrv: UpdateSignatureService,
    private router: Router
  ) {
    this.loadForm()
  }
  ngOnInit(): void {}
  loadForm() {
    this.authService.taxCode$.subscribe((taxCode) => {
      this.loginForm = this.fb.group({
        taxCode: ['', [Validators.required]],
        email: ['', [Validators.pattern(EMAIL_REGEX), Validators.required]],
        password: ['', [Validators.required]],
        digitalSignatureType: [null],
        digitalSignature: [''],
        serial: [''],
        provider: [''],
        effectiveDate: [''],
        expiryDate: [''],
        publicKey: [''],
        nameCert: [''],
        taxCodeCTS: [''],
        credentialId: ['']
      })

      this.loginForm.get('digitalSignatureType')?.valueChanges.subscribe((type) => {
        const taxCodeControl = this.loginForm.get('taxCode')

        if (type === '1') {
          taxCodeControl?.setValidators([Validators.required, Validators.pattern(/^\d{10}(-\d{3})?$/)])
        } else if (type === '2') {
          taxCodeControl?.setValidators([Validators.required, Validators.pattern(/^\d{1,13}$/)])
        } else {
          taxCodeControl?.setValidators([Validators.required])
        }

        taxCodeControl?.updateValueAndValidity()
      })

      this.getCTSForm = this.fb.group({
        msAcc: ['', [Validators.required]]
      })

      this.disableForm();

      this.getCTSForm.get('msAcc')?.valueChanges.subscribe((value) => {
    const control = this.getCTSForm.get('msAcc');
    if (!value && control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  });
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
      this.updateSignature()
    } else {
      console.log('Form is invalid!')
    }
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

  updateSignature() {
    const dataDialog = {
      title: 'Bạn có muốn cập nhật chữ ký số cho tài khoản quản trị không?'
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
          email: this.loginForm.value.email,
          adminPassword: this.loginForm.value.password,
          digitalSignatureType: this.loginForm.value.digitalSignatureType,
          digitalSignature:
            this.loginForm.value.digitalSignatureType === '1'
              ? this.loginForm.getRawValue().digitalSignature
              : this.loginForm.getRawValue().nameCert,
          serial: this.loginForm.getRawValue().serial,
          provider: this.loginForm.getRawValue().provider,
          effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
          expiryDate: this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
          publicKey: this.loginForm.getRawValue().publicKey,
          taxCodeCTS: this.loginForm.getRawValue().taxCodeCTS,
          credentialId: this.loginForm.getRawValue().credentialId
        }
        this.updateSignatureSrv.updateSignature(body).subscribe((res: any) => {
          if (res && res.success) {
            clearStore()
            this.authService.setLoginStatus(false)
            this.router.navigate(['vnaccs/login'])
            this.notification.success('Cập nhật chữ ký số cho tài khoản quản trị thành công')
          }
        })
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

  getPassError(): string | undefined {
    const control = this.loginForm.get('password')

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

  getMsAccError(): string | undefined {
    const control = this.getCTSForm.get('msAcc')
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Vui lòng nhập tài khoản MySign để lấy chứng thư số'
      }
    }
    return undefined
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
      this.updateSignatureSrv.getCertInfo(this.getCTSForm.value.msAcc).subscribe((res: any) => {
        if (res && res.message === 'success') {
          this.listOfData = res.data
        }
      })
    } else {
      console.log('Form is invalid!')
    }
    // this.listOfData = [
    //     {
    //         "certificates": [
    //             "MIIEZTCCA02gAwIBAgIQVAT//rcDP7MW1nIgHAZPMjANBgkqhkiG9w0BAQsFADA9\r\nMRYwFAYDVQQDDA1WaWV0dGVsLUNBIFJTMRYwFAYDVQQKDA1WaWV0dGVsIEdyb3Vw\r\nMQswCQYDVQQGEwJWTjAeFw0yNDExMTEwMjIxMDBaFw0yNTExMTEwMjIxMDBaMGQx\r\nCzAJBgNVBAYTAlZOMRMwEQYDVQQHDApC4bquQyBOSU5IMR0wGwYDVQQDDBROR1VZ\r\n4buETiBWxIJOIFRV4bqkTjEhMB8GCgmSJomT8ixkAQEMEUNNTkQ6MDI3MjAyMDA5\r\nNDc3MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwGVj4kRT+BvWwiL7\r\nqyBJ4xr6pvyPOAZxlk3Uy82wWqdLhONUDO86lP9TrEF6WssL/QfBHZMXFjpEMjGg\r\n2dLFLdbYo4fBIV4PxTQNyLV24pzV54HBThUh4FPNRbX0OBKddg/tnz9GdeKJGkPx\r\nV9BgyJ3KgmCNspCugE5vjFdOq71mx/BbquPs8MXO1Jm6bhsHdejqiqhBymbkknHB\r\nRbAuC5vZhhWZR8oH0DXHs7fwTpGLqEIygaevca+DSuFGgkbP1H5/Rf5wmKvcRBVB\r\nXOe6MMdPyUCb0898FSRz4YOP4KygproHosrs/pO++Z5dODTRCw34KfSxIKFgHxX/\r\ngWaKoQIDAQABo4IBODCCATQwNQYIKwYBBQUHAQEEKTAnMCUGCCsGAQUFBzABhhlo\r\ndHRwOi8vb2NzcC52aWV0dGVsLWNhLnZuMB0GA1UdDgQWBBQuIcChbOC5d972hwkX\r\nG+asxAmVWzAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFNP0lQs0nhvfirbYq6Jy\r\nNTD81mEjMH4GA1UdHwR3MHUwc6AuoCyGKmh0dHA6Ly9jcmwudmlldHRlbC1jYS52\r\nbi9WaWV0dGVsLUNBLVJTLmNybKJBpD8wPTEWMBQGA1UEAwwNVmlldHRlbC1DQSBS\r\nUzEWMBQGA1UECgwNVmlldHRlbCBHcm91cDELMAkGA1UEBhMCVk4wDgYDVR0PAQH/\r\nBAQDAgXgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDBDANBgkqhkiG9w0B\r\nAQsFAAOCAQEAEEnrfJXujeAL1e/QI5XWXeQ5im1JP1EE7Iu+2XpiNPbX0WGKdLzx\r\nxCH6T3zWMreElT5qaQPsVO3oAb7+4nZmqJfZeNaI0Tst8MATHhWd6lbgBF/tqjf2\r\nCc91BDJUgQzB60ZIo5oL1rWxq72Q/jkb2SZiBULoPIO3+DSrzNcf2yEMyPUWQlNE\r\nGXkpE1YjK5SeoPGtzrMbeeoe2ab4aTaXfFeozNuZqcM+2FIG38E/7t6tFydL2u5r\r\n4us0CEZ9T7Nx+dfwn0xxCmsUWf+CYrP9NmWhuZwTHMcL9nSktbnk/6nn8ZCiiSrA\r\ncxMmRzB3pnV35L6FVY7MtYtUjHNVwTcFpg==",
    //             "MIIGFDCCA/ygAwIBAgIQIHCI0OZfLP6ac+Fpx2ZSDzANBgkqhkiG9w0BAQsFADCB\r\nozELMAkGA1UEBhMCVk4xMzAxBgNVBAoMKk1pbmlzdHJ5IG9mIEluZm9ybWF0aW9u\r\nIGFuZCBDb21tdW5pY2F0aW9uczE8MDoGA1UECwwzTmF0aW9uYWwgQ2VudHJlIG9m\r\nIERpZ2l0YWwgU2lnbmF0dXJlIEF1dGhlbnRpY2F0aW9uMSEwHwYDVQQDDBhWaWV0\r\nbmFtIE5hdGlvbmFsIFJvb3QgQ0EwHhcNMjIwOTI2MDIwOTMzWhcNMjcwOTI2MDIw\r\nOTMzWjA9MRYwFAYDVQQDDA1WaWV0dGVsLUNBIFJTMRYwFAYDVQQKDA1WaWV0dGVs\r\nIEdyb3VwMQswCQYDVQQGEwJWTjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\r\nggEBANAl6bxp+CgOCAI95ConnUkLZycqYa2+qd4FbVxF6Ir5P0GpgY3kiLfwKsY5\r\n8FdST2QiM4s1MoYRqvaCV5lLWYBsbLkWoXVE5mGNmAVS/QfTyZe7NJ3KoUVK1vMe\r\nujX3J03Ft1M3eCSok4K2/C5Qsf193XJBc5i5VLeeAMcW7NP0CJpcbhdtWkwMJE+T\r\nhjMLQ26J0OEG2ggjM21dPNAnZCHAFYLI1VILYX+Ajcpd5C8cHBbGl3CbgR/dizUC\r\nMv2gnD7ZwFwwXAIfnn5Qxo9m1wfINx0zwWKwDyxxfs8DECQfReqM5WzsO49dihvQ\r\nCk7ZugbfnWRutnsZ8HIFP7HAuXECAwEAAaOCAacwggGjMEIGCCsGAQUFBwEBBDYw\r\nNDAyBggrBgEFBQcwAoYmaHR0cHM6Ly9yb290Y2EuZ292LnZuL2NydC92bnJjYTI1\r\nNi5wN2IwgeAGA1UdIwSB2DCB1YAUfvCH7bG4nfsIg2+kFv3xuKximwGhgamkgaYw\r\ngaMxCzAJBgNVBAYTAlZOMTMwMQYDVQQKDCpNaW5pc3RyeSBvZiBJbmZvcm1hdGlv\r\nbiBhbmQgQ29tbXVuaWNhdGlvbnMxPDA6BgNVBAsMM05hdGlvbmFsIENlbnRyZSBv\r\nZiBEaWdpdGFsIFNpZ25hdHVyZSBBdXRoZW50aWNhdGlvbjEhMB8GA1UEAwwYVmll\r\ndG5hbSBOYXRpb25hbCBSb290IENBghEAlZK7jO6tWiSmuPcdfTI7WjAOBgNVHQ8B\r\nAf8EBAMCAYYwHQYDVR0OBBYEFNP0lQs0nhvfirbYq6JyNTD81mEjMBIGA1UdEwEB\r\n/wQIMAYBAf8CAQAwNwYDVR0fBDAwLjAsoCqgKIYmaHR0cHM6Ly9yb290Y2EuZ292\r\nLnZuL2NybC92bnJjYTI1Ni5jcmwwDQYJKoZIhvcNAQELBQADggIBAGNNpftziUlI\r\no47eSBakrSWpO8FDPKj5LkQdayJIR72wszvMdS2Srv8eo5aidE0zql4/QViC4e33\r\nfoe9C/PQQKgmr1ROpd7w1OrCXF/IZXO9IIhm0xqg1ktDG2CGb+2vz2J2XtE3gR7u\r\nwgyMGlZlSeztaKzwMzTxhwkdgYtSb6aBbJMM6f2M1Y8qpuqLNl5kFhI2E8M8PUBk\r\n3OqD3OascEhnqb7X1rp8Atx7IJf04kIvMQkB092hkKO4Z2sLx2gy3H/YjrEpcTYT\r\n7F85PJLX9pXdihYScstlwWFEZzJjSNiMhFeNb2XaEyWZbozjMFSdUPMQH7SyMz9k\r\nTCXDsU/aV0yaelFfSQLPybitu6O8UkUfawGNHLZyvlQ08OMlodwbs1VssF2ewecJ\r\nthQvNIzH0TI9jApPaR4/G73LjE+3EvpuD8qh64eX+WUXKWENlSU5BFUsW6uO7jec\r\nsBl9ESLvcXTukIe8ArpB/PR4tTUlx1mFsgF8LfbNiOumoomxtrdRYHQlUxHEiqIr\r\nzOIKHT182jm+L92mr6Cbi5k0ae3HxBGzdW0XuzUFr9BdUfU2r0jG4HFzMeBqs70r\r\nxRzUj10QAjf9/EzFEe10I5j0u5ItGa2FJvkMI0/Ac5ZHMx97o8K7AGs1Tf29T7l/\r\n7WG+2f+Ktg7nsuSUTYLki/ROQIcPWrao",
    //             "MIIG/DCCBOSgAwIBAgIRAJWSu4zurVokprj3HX0yO1owDQYJKoZIhvcNAQELBQAw\r\ngaMxCzAJBgNVBAYTAlZOMTMwMQYDVQQKDCpNaW5pc3RyeSBvZiBJbmZvcm1hdGlv\r\nbiBhbmQgQ29tbXVuaWNhdGlvbnMxPDA6BgNVBAsMM05hdGlvbmFsIENlbnRyZSBv\r\nZiBEaWdpdGFsIFNpZ25hdHVyZSBBdXRoZW50aWNhdGlvbjEhMB8GA1UEAwwYVmll\r\ndG5hbSBOYXRpb25hbCBSb290IENBMB4XDTE0MDQxNTE2MjkyMFoXDTM5MDQxNTE2\r\nMjkyMFowgaMxCzAJBgNVBAYTAlZOMTMwMQYDVQQKDCpNaW5pc3RyeSBvZiBJbmZv\r\ncm1hdGlvbiBhbmQgQ29tbXVuaWNhdGlvbnMxPDA6BgNVBAsMM05hdGlvbmFsIENl\r\nbnRyZSBvZiBEaWdpdGFsIFNpZ25hdHVyZSBBdXRoZW50aWNhdGlvbjEhMB8GA1UE\r\nAwwYVmlldG5hbSBOYXRpb25hbCBSb290IENBMIICIjANBgkqhkiG9w0BAQEFAAOC\r\nAg8AMIICCgKCAgEAuKxaewgw2XB6afUf4zeVThQDl/G9xj56UoT+8KbW7BeIjkUe\r\nvwlUmK5/j4HQaIuNg7g9oiQaU2Gt7WM/fTR8p/PkQT7yzuY0uLzSxUO3d8LxBnFR\r\nhz/5Vnk6cfWcsZUwCEgU/LHrnVuRjIYsffdc3YDgUJkcbnnxRq6zTF9BG2xH3f3C\r\n68C4Y3yERae5MCukpNELXh6GctRR2FkShFeITzJUZSguCEJJAj5qYW3rakJud4Xj\r\nFFVgMnl6+78PYxvlAA8oFQrUbAywWq6Lzn6zcpo+OZuWfF7NFVGEcAtDuN1oyvst\r\n+H68f6giZ4+dKI4dBcrFkYJ+ptf98+Dev/Ij6onjOLgVgE/6LwprDIVY7X0vdqGG\r\n7Nbh6gaeugCG5/mYtIVkHhwPK+KcTPETYZJDYxT3rUIahaYh1Qp+LfEDXTJI2XGK\r\ney9lBkmFgdGpZY65p3xvrYW+NHccbtPsR+swcuuGRV7UP/ndmRX08GiaMTfKrkR7\r\nV5RvferDiQ/vezfq2hDPHizFaqxtImTUu8wFvXGbo11hsrqLCaKQxZToonYp7ECV\r\nYFDueuL7E6Up4cXler1qLvp3w+QZVR4r58IKvxVrtHaRiZUsbDa335dAlWjgaJI8\r\nQWZ4HOHVZLQjrX+JkjDPJTMHNxuMEkElrCSF3rXqUKZ/JMvqKeY16jQDaH0CAwEA\r\nAaOCAScwggEjMA4GA1UdDwEB/wQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\r\nDgQWBBR+8Iftsbid+wiDb6QW/fG4rGKbATCB4AYDVR0jBIHYMIHVgBR+8Iftsbid\r\n+wiDb6QW/fG4rGKbAaGBqaSBpjCBozELMAkGA1UEBhMCVk4xMzAxBgNVBAoMKk1p\r\nbmlzdHJ5IG9mIEluZm9ybWF0aW9uIGFuZCBDb21tdW5pY2F0aW9uczE8MDoGA1UE\r\nCwwzTmF0aW9uYWwgQ2VudHJlIG9mIERpZ2l0YWwgU2lnbmF0dXJlIEF1dGhlbnRp\r\nY2F0aW9uMSEwHwYDVQQDDBhWaWV0bmFtIE5hdGlvbmFsIFJvb3QgQ0GCEQCVkruM\r\n7q1aJKa49x19MjtaMA0GCSqGSIb3DQEBCwUAA4ICAQBNNunXKvYvaxzgOPbKsmJL\r\nZ1gqHpJeHzT74IzBHDgp8bgbLDtqH+PZV+w7DwvfZD8xuFKQJz9v5TDpz/CYwrhA\r\n+BUsxyMbzS6Kv1lNa42Ja63BlEQ1AAVY+ZX3mFbVumOV43kLQgzQayYKPolq1o7Q\r\nxz3l2zgzhg4o436Vfek8Lrh/WcP5ezyC8Tt7VCaUOl/fuSaCPYvZbV7bZw/Eyj4x\r\nK1ud7Uq2Op54vSTegoh0+ZW28SQEgH49BjyjQTv56sTRolWZ4WxbHtbBJwTj7vli\r\nksebvvljoRYo9wg29AuY/Arw3NNhTyIbUFO75colaaF8i+5aAvmPQzfIk9m1bzK1\r\n5VOk8t8QnV8i4I42jDLbVzbZFQZHbLL8gj+LTHVZc9sfKmfhkH2HDsngb6UvKDuW\r\nHB5+XQ5QoSiyGVJ0MeUYohPI6cghZXbIflHGyse9hbARM7Ubrisf/P//FDLlJ3UL\r\n7+aLIk9fw6n7Wy0WcgN+QxjfdxUM9VSCx705+uX/aN4y0g5LMNChDOzpBYUg6smm\r\n8A0W2LIAMw0Q9U9TLnHO8Ovw3ikuO5rfTSWwbYmyt15NsFp8LM/Q0Nu9QqaMNNy2\r\n3YbQZZlfFormI9ioWEpjDbWqU9YyH6oHpGjsBbSoR4G0IUsfxaDdE3CXIx48pRol\r\nSddeayvR5sdOsNrhJOAFwg=="
    //         ],
    //         "status": "valid",
    //         "issuerDN": "C=VN,O=Viettel Group,CN=Viettel-CA RS",
    //         "subjectDN": "027202009477",
    //         "serialNumber": "111681113028408966821000000000009588530",
    //         "validFrom": "20241212092100+0700",
    //         "validTo": "20251111092100+0700",
    //         "credentialId": "027202009477_5284476_20241111092133",
    //         "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwGVj4kRT+BvWwiL7qyBJ4xr6pvyPOAZxlk3Uy82wWqdLhONUDO86lP9TrEF6WssL/QfBHZMXFjpEMjGg2dLFLdbYo4fBIV4PxTQNyLV24pzV54HBThUh4FPNRbX0OBKddg/tnz9GdeKJGkPxV9BgyJ3KgmCNspCugE5vjFdOq71mx/BbquPs8MXO1Jm6bhsHdejqiqhBymbkknHBRbAuC5vZhhWZR8oH0DXHs7fwTpGLqEIygaevca+DSuFGgkbP1H5/Rf5wmKvcRBVBXOe6MMdPyUCb0898FSRz4YOP4KygproHosrs/pO++Z5dODTRCw34KfSxIKFgHxX/gWaKoQIDAQAB"
    //   },
    //   {
    //         "certificates": [
    //             "MIIEZTCCA02gAwIBAgIQVAT//rcDP7MW1nIgHAZPMjANBgkqhkiG9w0BAQsFADA9\r\nMRYwFAYDVQQDDA1WaWV0dGVsLUNBIFJTMRYwFAYDVQQKDA1WaWV0dGVsIEdyb3Vw\r\nMQswCQYDVQQGEwJWTjAeFw0yNDExMTEwMjIxMDBaFw0yNTExMTEwMjIxMDBaMGQx\r\nCzAJBgNVBAYTAlZOMRMwEQYDVQQHDApC4bquQyBOSU5IMR0wGwYDVQQDDBROR1VZ\r\n4buETiBWxIJOIFRV4bqkTjEhMB8GCgmSJomT8ixkAQEMEUNNTkQ6MDI3MjAyMDA5\r\nNDc3MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwGVj4kRT+BvWwiL7\r\nqyBJ4xr6pvyPOAZxlk3Uy82wWqdLhONUDO86lP9TrEF6WssL/QfBHZMXFjpEMjGg\r\n2dLFLdbYo4fBIV4PxTQNyLV24pzV54HBThUh4FPNRbX0OBKddg/tnz9GdeKJGkPx\r\nV9BgyJ3KgmCNspCugE5vjFdOq71mx/BbquPs8MXO1Jm6bhsHdejqiqhBymbkknHB\r\nRbAuC5vZhhWZR8oH0DXHs7fwTpGLqEIygaevca+DSuFGgkbP1H5/Rf5wmKvcRBVB\r\nXOe6MMdPyUCb0898FSRz4YOP4KygproHosrs/pO++Z5dODTRCw34KfSxIKFgHxX/\r\ngWaKoQIDAQABo4IBODCCATQwNQYIKwYBBQUHAQEEKTAnMCUGCCsGAQUFBzABhhlo\r\ndHRwOi8vb2NzcC52aWV0dGVsLWNhLnZuMB0GA1UdDgQWBBQuIcChbOC5d972hwkX\r\nG+asxAmVWzAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFNP0lQs0nhvfirbYq6Jy\r\nNTD81mEjMH4GA1UdHwR3MHUwc6AuoCyGKmh0dHA6Ly9jcmwudmlldHRlbC1jYS52\r\nbi9WaWV0dGVsLUNBLVJTLmNybKJBpD8wPTEWMBQGA1UEAwwNVmlldHRlbC1DQSBS\r\nUzEWMBQGA1UECgwNVmlldHRlbCBHcm91cDELMAkGA1UEBhMCVk4wDgYDVR0PAQH/\r\nBAQDAgXgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDBDANBgkqhkiG9w0B\r\nAQsFAAOCAQEAEEnrfJXujeAL1e/QI5XWXeQ5im1JP1EE7Iu+2XpiNPbX0WGKdLzx\r\nxCH6T3zWMreElT5qaQPsVO3oAb7+4nZmqJfZeNaI0Tst8MATHhWd6lbgBF/tqjf2\r\nCc91BDJUgQzB60ZIo5oL1rWxq72Q/jkb2SZiBULoPIO3+DSrzNcf2yEMyPUWQlNE\r\nGXkpE1YjK5SeoPGtzrMbeeoe2ab4aTaXfFeozNuZqcM+2FIG38E/7t6tFydL2u5r\r\n4us0CEZ9T7Nx+dfwn0xxCmsUWf+CYrP9NmWhuZwTHMcL9nSktbnk/6nn8ZCiiSrA\r\ncxMmRzB3pnV35L6FVY7MtYtUjHNVwTcFpg==",
    //             "MIIGFDCCA/ygAwIBAgIQIHCI0OZfLP6ac+Fpx2ZSDzANBgkqhkiG9w0BAQsFADCB\r\nozELMAkGA1UEBhMCVk4xMzAxBgNVBAoMKk1pbmlzdHJ5IG9mIEluZm9ybWF0aW9u\r\nIGFuZCBDb21tdW5pY2F0aW9uczE8MDoGA1UECwwzTmF0aW9uYWwgQ2VudHJlIG9m\r\nIERpZ2l0YWwgU2lnbmF0dXJlIEF1dGhlbnRpY2F0aW9uMSEwHwYDVQQDDBhWaWV0\r\nbmFtIE5hdGlvbmFsIFJvb3QgQ0EwHhcNMjIwOTI2MDIwOTMzWhcNMjcwOTI2MDIw\r\nOTMzWjA9MRYwFAYDVQQDDA1WaWV0dGVsLUNBIFJTMRYwFAYDVQQKDA1WaWV0dGVs\r\nIEdyb3VwMQswCQYDVQQGEwJWTjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\r\nggEBANAl6bxp+CgOCAI95ConnUkLZycqYa2+qd4FbVxF6Ir5P0GpgY3kiLfwKsY5\r\n8FdST2QiM4s1MoYRqvaCV5lLWYBsbLkWoXVE5mGNmAVS/QfTyZe7NJ3KoUVK1vMe\r\nujX3J03Ft1M3eCSok4K2/C5Qsf193XJBc5i5VLeeAMcW7NP0CJpcbhdtWkwMJE+T\r\nhjMLQ26J0OEG2ggjM21dPNAnZCHAFYLI1VILYX+Ajcpd5C8cHBbGl3CbgR/dizUC\r\nMv2gnD7ZwFwwXAIfnn5Qxo9m1wfINx0zwWKwDyxxfs8DECQfReqM5WzsO49dihvQ\r\nCk7ZugbfnWRutnsZ8HIFP7HAuXECAwEAAaOCAacwggGjMEIGCCsGAQUFBwEBBDYw\r\nNDAyBggrBgEFBQcwAoYmaHR0cHM6Ly9yb290Y2EuZ292LnZuL2NydC92bnJjYTI1\r\nNi5wN2IwgeAGA1UdIwSB2DCB1YAUfvCH7bG4nfsIg2+kFv3xuKximwGhgamkgaYw\r\ngaMxCzAJBgNVBAYTAlZOMTMwMQYDVQQKDCpNaW5pc3RyeSBvZiBJbmZvcm1hdGlv\r\nbiBhbmQgQ29tbXVuaWNhdGlvbnMxPDA6BgNVBAsMM05hdGlvbmFsIENlbnRyZSBv\r\nZiBEaWdpdGFsIFNpZ25hdHVyZSBBdXRoZW50aWNhdGlvbjEhMB8GA1UEAwwYVmll\r\ndG5hbSBOYXRpb25hbCBSb290IENBghEAlZK7jO6tWiSmuPcdfTI7WjAOBgNVHQ8B\r\nAf8EBAMCAYYwHQYDVR0OBBYEFNP0lQs0nhvfirbYq6JyNTD81mEjMBIGA1UdEwEB\r\n/wQIMAYBAf8CAQAwNwYDVR0fBDAwLjAsoCqgKIYmaHR0cHM6Ly9yb290Y2EuZ292\r\nLnZuL2NybC92bnJjYTI1Ni5jcmwwDQYJKoZIhvcNAQELBQADggIBAGNNpftziUlI\r\no47eSBakrSWpO8FDPKj5LkQdayJIR72wszvMdS2Srv8eo5aidE0zql4/QViC4e33\r\nfoe9C/PQQKgmr1ROpd7w1OrCXF/IZXO9IIhm0xqg1ktDG2CGb+2vz2J2XtE3gR7u\r\nwgyMGlZlSeztaKzwMzTxhwkdgYtSb6aBbJMM6f2M1Y8qpuqLNl5kFhI2E8M8PUBk\r\n3OqD3OascEhnqb7X1rp8Atx7IJf04kIvMQkB092hkKO4Z2sLx2gy3H/YjrEpcTYT\r\n7F85PJLX9pXdihYScstlwWFEZzJjSNiMhFeNb2XaEyWZbozjMFSdUPMQH7SyMz9k\r\nTCXDsU/aV0yaelFfSQLPybitu6O8UkUfawGNHLZyvlQ08OMlodwbs1VssF2ewecJ\r\nthQvNIzH0TI9jApPaR4/G73LjE+3EvpuD8qh64eX+WUXKWENlSU5BFUsW6uO7jec\r\nsBl9ESLvcXTukIe8ArpB/PR4tTUlx1mFsgF8LfbNiOumoomxtrdRYHQlUxHEiqIr\r\nzOIKHT182jm+L92mr6Cbi5k0ae3HxBGzdW0XuzUFr9BdUfU2r0jG4HFzMeBqs70r\r\nxRzUj10QAjf9/EzFEe10I5j0u5ItGa2FJvkMI0/Ac5ZHMx97o8K7AGs1Tf29T7l/\r\n7WG+2f+Ktg7nsuSUTYLki/ROQIcPWrao",
    //             "MIIG/DCCBOSgAwIBAgIRAJWSu4zurVokprj3HX0yO1owDQYJKoZIhvcNAQELBQAw\r\ngaMxCzAJBgNVBAYTAlZOMTMwMQYDVQQKDCpNaW5pc3RyeSBvZiBJbmZvcm1hdGlv\r\nbiBhbmQgQ29tbXVuaWNhdGlvbnMxPDA6BgNVBAsMM05hdGlvbmFsIENlbnRyZSBv\r\nZiBEaWdpdGFsIFNpZ25hdHVyZSBBdXRoZW50aWNhdGlvbjEhMB8GA1UEAwwYVmll\r\ndG5hbSBOYXRpb25hbCBSb290IENBMB4XDTE0MDQxNTE2MjkyMFoXDTM5MDQxNTE2\r\nMjkyMFowgaMxCzAJBgNVBAYTAlZOMTMwMQYDVQQKDCpNaW5pc3RyeSBvZiBJbmZv\r\ncm1hdGlvbiBhbmQgQ29tbXVuaWNhdGlvbnMxPDA6BgNVBAsMM05hdGlvbmFsIENl\r\nbnRyZSBvZiBEaWdpdGFsIFNpZ25hdHVyZSBBdXRoZW50aWNhdGlvbjEhMB8GA1UE\r\nAwwYVmlldG5hbSBOYXRpb25hbCBSb290IENBMIICIjANBgkqhkiG9w0BAQEFAAOC\r\nAg8AMIICCgKCAgEAuKxaewgw2XB6afUf4zeVThQDl/G9xj56UoT+8KbW7BeIjkUe\r\nvwlUmK5/j4HQaIuNg7g9oiQaU2Gt7WM/fTR8p/PkQT7yzuY0uLzSxUO3d8LxBnFR\r\nhz/5Vnk6cfWcsZUwCEgU/LHrnVuRjIYsffdc3YDgUJkcbnnxRq6zTF9BG2xH3f3C\r\n68C4Y3yERae5MCukpNELXh6GctRR2FkShFeITzJUZSguCEJJAj5qYW3rakJud4Xj\r\nFFVgMnl6+78PYxvlAA8oFQrUbAywWq6Lzn6zcpo+OZuWfF7NFVGEcAtDuN1oyvst\r\n+H68f6giZ4+dKI4dBcrFkYJ+ptf98+Dev/Ij6onjOLgVgE/6LwprDIVY7X0vdqGG\r\n7Nbh6gaeugCG5/mYtIVkHhwPK+KcTPETYZJDYxT3rUIahaYh1Qp+LfEDXTJI2XGK\r\ney9lBkmFgdGpZY65p3xvrYW+NHccbtPsR+swcuuGRV7UP/ndmRX08GiaMTfKrkR7\r\nV5RvferDiQ/vezfq2hDPHizFaqxtImTUu8wFvXGbo11hsrqLCaKQxZToonYp7ECV\r\nYFDueuL7E6Up4cXler1qLvp3w+QZVR4r58IKvxVrtHaRiZUsbDa335dAlWjgaJI8\r\nQWZ4HOHVZLQjrX+JkjDPJTMHNxuMEkElrCSF3rXqUKZ/JMvqKeY16jQDaH0CAwEA\r\nAaOCAScwggEjMA4GA1UdDwEB/wQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\r\nDgQWBBR+8Iftsbid+wiDb6QW/fG4rGKbATCB4AYDVR0jBIHYMIHVgBR+8Iftsbid\r\n+wiDb6QW/fG4rGKbAaGBqaSBpjCBozELMAkGA1UEBhMCVk4xMzAxBgNVBAoMKk1p\r\nbmlzdHJ5IG9mIEluZm9ybWF0aW9uIGFuZCBDb21tdW5pY2F0aW9uczE8MDoGA1UE\r\nCwwzTmF0aW9uYWwgQ2VudHJlIG9mIERpZ2l0YWwgU2lnbmF0dXJlIEF1dGhlbnRp\r\nY2F0aW9uMSEwHwYDVQQDDBhWaWV0bmFtIE5hdGlvbmFsIFJvb3QgQ0GCEQCVkruM\r\n7q1aJKa49x19MjtaMA0GCSqGSIb3DQEBCwUAA4ICAQBNNunXKvYvaxzgOPbKsmJL\r\nZ1gqHpJeHzT74IzBHDgp8bgbLDtqH+PZV+w7DwvfZD8xuFKQJz9v5TDpz/CYwrhA\r\n+BUsxyMbzS6Kv1lNa42Ja63BlEQ1AAVY+ZX3mFbVumOV43kLQgzQayYKPolq1o7Q\r\nxz3l2zgzhg4o436Vfek8Lrh/WcP5ezyC8Tt7VCaUOl/fuSaCPYvZbV7bZw/Eyj4x\r\nK1ud7Uq2Op54vSTegoh0+ZW28SQEgH49BjyjQTv56sTRolWZ4WxbHtbBJwTj7vli\r\nksebvvljoRYo9wg29AuY/Arw3NNhTyIbUFO75colaaF8i+5aAvmPQzfIk9m1bzK1\r\n5VOk8t8QnV8i4I42jDLbVzbZFQZHbLL8gj+LTHVZc9sfKmfhkH2HDsngb6UvKDuW\r\nHB5+XQ5QoSiyGVJ0MeUYohPI6cghZXbIflHGyse9hbARM7Ubrisf/P//FDLlJ3UL\r\n7+aLIk9fw6n7Wy0WcgN+QxjfdxUM9VSCx705+uX/aN4y0g5LMNChDOzpBYUg6smm\r\n8A0W2LIAMw0Q9U9TLnHO8Ovw3ikuO5rfTSWwbYmyt15NsFp8LM/Q0Nu9QqaMNNy2\r\n3YbQZZlfFormI9ioWEpjDbWqU9YyH6oHpGjsBbSoR4G0IUsfxaDdE3CXIx48pRol\r\nSddeayvR5sdOsNrhJOAFwg=="
    //         ],
    //         "status": "valid",
    //         "issuerDN": "C=VN,O=Viettel Group,CN=Viettel-CA RS",
    //         "subjectDN": "027202009477",
    //         "serialNumber": "111681113028408966821000000000009588530",
    //         "validFrom": "20241010092100+0700",
    //         "validTo": "20241111092100+0700",
    //         "credentialId": "027202009477_5284476_20241111092133",
    //         "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwGVj4kRT+BvWwiL7qyBJ4xr6pvyPOAZxlk3Uy82wWqdLhONUDO86lP9TrEF6WssL/QfBHZMXFjpEMjGg2dLFLdbYo4fBIV4PxTQNyLV24pzV54HBThUh4FPNRbX0OBKddg/tnz9GdeKJGkPxV9BgyJ3KgmCNspCugE5vjFdOq71mx/BbquPs8MXO1Jm6bhsHdejqiqhBymbkknHBRbAuC5vZhhWZR8oH0DXHs7fwTpGLqEIygaevca+DSuFGgkbP1H5/Rf5wmKvcRBVBXOe6MMdPyUCb0898FSRz4YOP4KygproHosrs/pO++Z5dODTRCw34KfSxIKFgHxX/gWaKoQIDAQAB"
    //     }
    // ]
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
