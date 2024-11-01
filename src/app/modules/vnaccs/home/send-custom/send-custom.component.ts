import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzStepsModule } from 'ng-zorro-antd/steps'
import { NotificationService } from '../../../../shared/services/notification.service'
import { LoginService } from '../../login/login.service'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { RouterLink } from '@angular/router'
import { DialogService } from '../../../../shared/services/dialog.service'
import { ConfirmPopupComponent } from '../../../../shared/components/confirm-popup/confirm-popup.component'
import { SendCustomService } from './send-custom.service'
import { STORAGE_KEYS } from '../../../../shared/constants/system.const'

@Component({
  selector: 'app-send-custom',
  templateUrl: './send-custom.component.html',
  styleUrls: ['./send-custom.component.scss'],
  standalone: true,
  imports: [
    NzStepsModule,
    CommonModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzTableModule,
    NzToolTipModule,
    NzRadioModule,
    RouterLink
  ]
})
export class SendCustomComponent {
  current = 0

  index = 'First-content'

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

  radioValue = '1'
  isVisible: boolean = false
  isVisibleDownload: boolean = false
  isOkLoading = false

  msAcc = ''
  listOfData: any[] = []

  optionFileStatuss = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' }
  ]

  form!: FormGroup
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign'
  modalTitle: string = 'Lấy chứng thư số'
  isAbleBtnSign: boolean = false
  isSigned: boolean = false
  isSent: boolean = false

  constructor(
    private notification: NotificationService,
    private loginSrv: LoginService,
    private fb: FormBuilder,
    private dialogSrv: DialogService,
    private sendSrv: SendCustomService
  ) {}

  ngOnInit() {
    this.loadForm()
  }

  loadForm() {
    this.form = this.fb.group({
      fullName: [''],
      registerPlace: [null],
      digitalSignatureType: [this.radioValue],
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
    this.form.get('digitalSignature')?.disable()
    this.form.get('serial')?.disable()
    this.form.get('provider')?.disable()
    this.form.get('effectiveDate')?.disable()
    this.form.get('expiryDate')?.disable()
    this.form.get('publicKey')?.disable()
    this.form.get('nameCert')?.disable()
  }

  pre(): void {
    this.current -= 1
  }

  done(): void {
    console.log('done')
  }

  sendCustom() {
    const data = {
      title: 'Bạn có muốn gửi tới Hải quan không?'
    }
    const dialogRef = this.dialogSrv.openDialog(ConfirmPopupComponent, '', data, {
      nzClosable: false,
      nzWidth: '400px',
      nzCentered: true,
      nzClassName: 'popup-radius-2'
    })
    dialogRef.afterClose.subscribe((result: any) => {
      if (result) {
        let id: any
        const state = history.state
        if (state && state.data) {
          // console.log(state.data)
          id = state.data.id
        }
        const token: any = localStorage?.getItem(STORAGE_KEYS.TOKEN) || sessionStorage?.getItem(STORAGE_KEYS.TOKEN)
        let decoded: any
        if (token) {
          decoded = this.decodeToken(token)
        }

        const taxCode: any =
          localStorage.getItem(STORAGE_KEYS.TAX_CODE) || sessionStorage.getItem(STORAGE_KEYS.TAX_CODE)

        const body = {
          objectId: decoded.sub,
          taxCode: taxCode,
          nameSender: this.form.get('fullName')?.value,
          digitalSignatureType: this.form.get('digitalSignatureType')?.value,
          nameCert: this.form.get('nameCert')?.value,
          digitalSignature: this.form.get('digitalSignature')?.getRawValue(),
          serial: this.form.get('serial')?.getRawValue(),
          provider: this.form.get('provider')?.getRawValue(),
          effectiveDate: this.convertDateTimestamp(this.form.getRawValue().effectiveDate),
          expiryDate: this.convertDateTimestamp(this.form.getRawValue().expiryDate),
          publicKey: this.form.get('publicKey')?.getRawValue(),
          credentialId: this.form.get('credentialId')?.getRawValue(),
          taxCodeCTS: this.form.get('taxCodeCTS')?.getRawValue()
        }

        this.sendSrv.sendCustom(id, body).subscribe((res: any) => {
          if (res && res.success) {
            // console.log(res)
            this.current += 1
            this.isSent = true
          }
        })
      }
    })
  }

  sign() {
    let id: any
    const state = history.state
    if (state && state.data) {
      id = state.data.id
    }
    const token: any = localStorage?.getItem(STORAGE_KEYS.TOKEN) || sessionStorage?.getItem(STORAGE_KEYS.TOKEN)
    let decoded: any
    if (token) {
      decoded = this.decodeToken(token)
    }

    const body = {
      objectId: decoded.sub,
      nameSender: this.form.get('fullName')?.value,
      digitalSignatureType: this.form.get('digitalSignatureType')?.value,
      nameCert: this.form.get('nameCert')?.value,
      digitalSignature: this.form.get('digitalSignature')?.getRawValue(),
      serial: this.form.get('serial')?.getRawValue(),
      provider: this.form.get('provider')?.getRawValue(),
      effectiveDate: this.convertDateTimestamp(this.form.getRawValue().effectiveDate),
      expiryDate: this.convertDateTimestamp(this.form.getRawValue().expiryDate),
      publicKey: this.form.get('publicKey')?.getRawValue(),
      credentialId: this.form.get('credentialId')?.getRawValue(),
      taxCodeCTS: this.form.get('taxCodeCTS')?.getRawValue()
    }

    this.sendSrv.checkSenddCustom(id, body).subscribe((res: any) => {
      if (res && res.success) {
        // console.log(res)
        this.isSigned = true
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
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const decodedPayload = JSON.parse(window.atob(base64))

      return decodedPayload
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error)
      return null
    }
  }

  convertDateTimestamp(date: any) {
    const [d, m, y] = date.split(/-|\//) // splits "26-02-2012" or "26/02/2012"
    const dateNew = new Date(y, m - 1, d)
    return dateNew.getTime()
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
      this.form.get('digitalSignature')?.setValue(data.subjectDN)
      this.form.get('serial')?.setValue(data.serialNumber)
      this.form.get('provider')?.setValue(data.issuerDN)
      this.form.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom))
      this.form.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo))
      this.form.get('nameCert')?.setValue(data.subjectDN)
      this.form.get('publicKey')?.setValue(data.subjectDN) //check
      this.form.get('credentialId')?.setValue(data.credentialId)
      this.form.get('taxCodeCTS')?.setValue(data.subjectDN)
    }
  }
}
