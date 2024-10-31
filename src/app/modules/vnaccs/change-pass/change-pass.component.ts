import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HeaderVnaccsComponent } from '../../../layouts/header/header.component';
import { FooterVnaccsComponent } from '../../../layouts/footer/footer.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ChangePassService } from './change-pass.service';
import { Subject } from 'rxjs';
import { STORAGE_KEYS } from '../../../shared/constants/system.const';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../../../shared/services/auth.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';
import { clearStore } from '../../../shared/utilities/system.utils';




@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.scss'],
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
    RouterLink
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChangePassComponent implements OnInit {
  loginForm!: FormGroup;
  passwordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  radioValue = '1';
  optionFileStatus = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' },
  ];
  optionFileStatuss = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' },
  ];
  modalTitle: string = 'Lấy chứng thư số';
  isVisible = false;
  isOkLoading = false;

  listOfData: any = [];

  msAcc: string = '';

  isVisibleDownload: boolean = false;
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign';

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private notification: NotificationService,
    private changepassSrv: ChangePassService,
    private dialogService: DialogService,
    private authService: AuthService
  ) {
    this.loadForm();
  }
  ngOnInit(): void {
  }
  loadForm() {
    this.authService.taxCode$.subscribe(taxCode => {
      this.loginForm = this.fb.group({
        taxCode: [localStorage.getItem(STORAGE_KEYS.TAX_CODE), [Validators.required]],
        password: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
        confirmPassword: ['', [Validators.required]],
        digitalSignatureType: [null],
        digitalSignature: [''],
        serial: [''],
        provider: [''],
        effectiveDate: [''],
        expiryDate: [''],
        publicKey: [''],
        nameCert: ['']
      }, {validators: this.passwordMatchValidator.bind(this)});

      this.disableForm();
    })
  }

  disableForm() {
    this.loginForm.get('taxCode')?.disable();
    this.loginForm.get('digitalSignature')?.disable();
    this.loginForm.get('serial')?.disable();
    this.loginForm.get('provider')?.disable();
    this.loginForm.get('effectiveDate')?.disable();
    this.loginForm.get('expiryDate')?.disable();
    this.loginForm.get('publicKey')?.disable();
    this.loginForm.get('nameCert')?.disable();
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.changepass();
    }
    else {
      console.log('Form is invalid!');
    }
  }
  changepass() {
    const dataDialog = {
      title: 'Bạn có muốn đổi mật khẩu không?',
    };

    const dialogRef = this.dialogService.openDialog(
      ConfirmPopupComponent,
      '',
      dataDialog,
      {
        nzClosable: false,
        nzWidth: '400px',
        nzCentered: true,
        nzClassName: 'popup-radius-2',
      }
    );

    dialogRef.afterClose.subscribe((result: boolean) => {
      if(result) {
        const body = {
          taxCode: this.loginForm.getRawValue().taxCode,
          oldPassword: this.loginForm.value.password,
          newPassword: this.loginForm.value.newPassword,
          confirmPassword: this.loginForm.value.confirmPassword,
          digitalSignatureType: this.loginForm.value.digitalSignatureType,
          digitalSignature: this.loginForm.getRawValue().taxCode,
          serial: this.loginForm.getRawValue().serial,
          provider: this.loginForm.getRawValue().provider,
          effectiveDate: this.convertDateTimestamp(this.loginForm.getRawValue().effectiveDate),
          expiryDate:this.convertDateTimestamp(this.loginForm.getRawValue().expiryDate),
          publicKey: this.loginForm.getRawValue().publicKey,
        };
        this.changepassSrv.changepass(body).subscribe((res: any) => {
          if(res && res.success) {
            clearStore();
            this.authService.setLoginStatus(false);
            this.router.navigate(['vnaccs/login']);
            this.notification.success(res.message);
          }
        })
      }
    })
  }
  convertDateTimestamp(date: any) {
    const [d, m, y] = date.split(/-|\//); // splits "26-02-2012" or "26/02/2012"
    const dateNew = new Date(y, m - 1, d);
    return dateNew.getTime();
  }
  formatDateFromString = (dateString: string): string | null => {
    if (dateString.length < 8) {
      return null;
    }
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    const date = new Date(`${year}-${month}-${day}`);

    if (isNaN(date.getTime())) {
      return null;
    }

    return `${day}/${month}/${year}`;
  };

  getTaxCodeError(): string | undefined {
    const control = this.loginForm.get('taxCode');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mã số thuế không được để trống';
      }
    }
    return undefined;
  }

  getPassError() {
    const control = this.loginForm.get('password');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu hiện tại không được để trống';
      }
    }
    return undefined;
  }
  getNewPassError() {
    const control = this.loginForm.get('newPassword');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu mới không được để trống';
      }
      if (control.errors?.['pattern']) {
        return 'Mật khẩu tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
      }
    }
    return undefined;
  }
  getConfirmPassError(): string | undefined {
    const control = this.loginForm.get('confirmPassword');
    if (control?.touched) {
      if (control.errors?.['required']) {
        return 'Xác nhận lại mật khẩu mới không được để trống';
      }
      if (this.loginForm.errors?.['notmatching']) {
        return 'Xác nhận lại mật khẩu mới phải giống mật khẩu đã nhập';
      }
    }
    return undefined;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    if (pass && confirmPass && pass !== confirmPass) {
      return { notmatching: true };
    }
    return null;
  }


  copyText(): void {
    const inputElement = document.getElementById('copyInput') as HTMLInputElement;
    if (inputElement) {
      inputElement.select();
      inputElement.setSelectionRange(0, 99999);
      document.execCommand('copy');
      this.notification.success('Đã sao chép đường dẫn');
    }
  }
  navigateToDownload(store: string): void {
    if(store === 'appstore') {
      window.open('https://apps.apple.com/vn/app/mysign/id1633019232', '_blank');
    }
    if(store === 'chplay') {
      window.open('https://play.google.com/store/apps/details?id=com.viettel.cloud.ca.mysign&hl=vi', '_blank');
    }
  }

  showModal() {
    console.log('h')

    this.isVisible = true;
    this.msAcc = '';
    this.listOfData = [];
  }
  showModalDownload() {
    this.isVisible = false;
    this.isVisibleDownload = true;
  }

  handleOk() {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  handleOkDownload() {
    this.isVisibleDownload = false;
    // this.router.navigate(['vnaccs/register']);
  }

  handleCancelDownload(): void {
    this.isVisibleDownload = false;
    // this.router.navigate(['vnaccs/register']);
  }

  getCTS() {
    if(this.msAcc === '') {
      this.notification.error('Vui lòng nhập tài khoản MySign để lấy chứng thư số')
    }
    this.changepassSrv.getCertInfo(this.msAcc).subscribe((res: any) => {
      if(res && res.message === 'success') {
        this.listOfData = res.data;
      }
      else {
        this.notification.error('Có lỗi xảy ra khi kết nối với hệ thống Viettel - MySign. Vui lòng thử lại hoặc liên hệ quản trị viên')
      }
    })
  }

  convertComplexDateString(dateStr: string): number {
    // Chuyển chuỗi 'YYYYMMDDHHmmss±zzzz' thành định dạng ISO 8601
    const isoFormattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}${dateStr.slice(14)}`;

    // Tạo đối tượng Date từ chuỗi đã định dạng
    const dateObj = new Date(isoFormattedDate);

    // Trả về timestamp (số milliseconds từ epoch)
    return dateObj.getTime();
  }

  applyData(data: any) {
    const currentDate = new Date().getTime();
    const validDate = this.convertComplexDateString(data.validFrom);
    const expireDate = this.convertComplexDateString(data.validTo);
    if(validDate > currentDate) {
      console.log('Chữ ký số chưa có hiệu lực')
      this.notification.error('Chữ ký số chưa có hiệu lực');
    }
    else if(expireDate < currentDate) {
      console.log('Chữ ký số đã hết hiệu lực')
      this.notification.error('Chữ ký số đã hết hiệu lực')
    }
    else {
      this.isVisible = false;
      // this.loginForm.get('digitalSignature')?.setValue(data.subjectDN);
      this.loginForm.get('serial')?.setValue(data.serialNumber);
      this.loginForm.get('provider')?.setValue(data.issuerDN);
      this.loginForm.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom));
      this.loginForm.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo));
      this.loginForm.get('nameCert')?.setValue(data.subjectDN);
      this.loginForm.get('publicKey')?.setValue(data.subjectDN);//check
      // this.loginForm.enable()
      // this.disableForm();
    }
  }
}
