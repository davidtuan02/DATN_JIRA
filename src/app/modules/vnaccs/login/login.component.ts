import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { LoginService } from './login.service';
import { Subject } from 'rxjs';
import { STORAGE_KEYS } from '../../../shared/constants/system.const';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { PasswordMaskDirective } from './mask-password.directive';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../../../shared/services/auth.service';




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
    NzToolTipModule
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordVisible = false;
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
    private loginSrv: LoginService,
    private router: Router,
    private notification: NotificationService,
    private message: NzMessageService,
    private authService: AuthService
  ) {
    this.loadForm();
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
      nameCert: ['']
    });
    this.disableForm();
  }

  disableForm() {
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
      this.login();
    }
    else {
      console.log('Form is invalid!');
    }
  }

  convertDateTimestamp(date: any) {
    const [d, m, y] = date.split(/-|\//); // splits "26-02-2012" or "26/02/2012"
    const dateNew = new Date(y, m - 1, d);
    return dateNew.getTime();
  }

  login() {
    const body = {
      taxCode: this.loginForm.value.taxCode,
      adminPassword: this.loginForm.value.adminPassword,
      digitalSignatureType: this.loginForm.value.digitalSignatureType,
      digitalSignature: this.loginForm.value.digitalSignature,
      serial: this.loginForm.value.serial,
      provider: this.loginForm.value.provider,
      effectiveDate: this.convertDateTimestamp(this.loginForm.value.effectiveDate),
      expiryDate:this.convertDateTimestamp(this.loginForm.value.expiryDate),
      publicKey: this.loginForm.value.publicKey,
    };
    this.loginSrv.login(body).subscribe((res: any) => {
      if(res && res.code === 200) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.result.token);
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, res.result.token);
        this.router.navigate(['vnaccs']);
        this.authService.setLoginStatus(true);
      }
    })
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

  convertDateToYMD = (dateString: string): string | null => {
    const parts = dateString.split('/');

    if (parts.length !== 3) {
      return null;
    }

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
      return null;
    }

    return `${year}-${month}-${day}`;
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
    const control = this.loginForm.get('adminPassword');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'Mật khẩu không được để trống';
      }
    }
    return undefined;
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
    this.loginSrv.getCertInfo(this.msAcc).subscribe((res: any) => {
      if(res && res.message === 'success') {
        this.listOfData = res.data;
      }
      else {
        this.notification.error('Có lỗi xảy ra khi kết nối với hệ thống Viettel - MySign. Vui lòng thử lại hoặc liên hệ quản trị viên')
      }
    })
  }

  applyData(data: any) {
    const currentDate = new Date();
    const validDate = new Date(data.validFrom);
    const expireDate = new Date(data.validTo);
    console.log(currentDate)
    console.log(validDate)
    console.log(expireDate)
    if(validDate > currentDate) {
      this.notification.error('Chữ ký số chưa có hiệu lực');
    }
    else if(expireDate < currentDate) {
      this.notification.error('Chữ ký số đã hết hiệu lực')
    }
    else {
      this.isVisible = false;
      this.loginForm.get('digitalSignature')?.setValue(data.subjectDN);
      this.loginForm.get('serial')?.setValue(data.serialNumber);
      this.loginForm.get('provider')?.setValue(data.subjectDN);
      this.loginForm.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom));
      this.loginForm.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo));
      this.loginForm.get('publicKey')?.setValue(data.subjectDN);
      this.loginForm.get('nameCert')?.setValue(data.subjectDN);
      this.loginForm.enable()
      // this.disableForm();
    }
  }
}
