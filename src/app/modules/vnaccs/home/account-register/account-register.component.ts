import { ChangeDetectorRef, Component } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CUSTOMER_TABLE_SIZE, DATE_FORMAT, FILE_STATUS, FILE_TYPE, INIT_PAGE, INIT_SIZE } from "../../../../shared/components/common.const";
import { NzButtonComponent, NzButtonModule, NzButtonSize } from "ng-zorro-antd/button";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { CommonModule, DatePipe } from "@angular/common";
import { AccountRegisterService } from "./account-register.service";
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { NzModalModule } from "ng-zorro-antd/modal";
import { Router, RouterLink } from "@angular/router";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { NotificationService } from "../../../../shared/services/notification.service";
import { DialogService } from "../../../../shared/services/dialog.service";
import { ConfirmPopupComponent } from "../../../../shared/components/confirm-popup/confirm-popup.component";
import { AuthService } from "../../../../shared/services/auth.service";
import { STORAGE_KEYS } from "../../../../shared/constants/system.const";
import { debounceTime, Subject } from "rxjs";
// import jwt_decode from 'jwt-decode';

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
  ]
})

export class AccountRegisterComponent {
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
  dateFormat = DATE_FORMAT.COMMON;
  size: NzButtonSize = 'large';
  form!: FormGroup;
  formValidateUserId!: FormGroup;

  selectedValue = null;
  optionFileStatus = FILE_STATUS;
  optionFileType = FILE_TYPE;

  dataTable: any[] = [
    {
      "fullName": "Tran Van B",
      "email": "tranvanb@example.com",
      "idType": 1,
      "idNo": "987654321",
      "fieldOfActivity": 101,
      "customsEffectiveDate": "2024-01-01T00:00:00",
      "customsExpiryDate": "2025-12-31T00:00:00",
      "digitalSignatureType": 2,
      "digitalSignature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...",
      "serial": "1234567890",
      "provider": "VNPT",
      "effectiveDate": "2024-01-01T00:00:00",
      "expiryDate": "2025-12-31T00:00:00",
      "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr..."
    },
    {
      "fullName": "Nguyen Thi C",
      "email": "nguyenthic@example.com",
      "idType": 1,
      "idNo": "123456789",
      "fieldOfActivity": 102,
      "customsEffectiveDate": "2024-02-01T00:00:00",
      "customsExpiryDate": "2026-01-31T00:00:00",
      "digitalSignatureType": 1,
      "digitalSignature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp...",
      "serial": "0987654321",
      "provider": "FPT",
      "effectiveDate": "2024-02-01T00:00:00",
      "expiryDate": "2026-01-31T00:00:00",
      "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy..."
    },
    {
      "fullName": "Le Van D",
      "email": "levand@example.com",
      "idType": 2,
      "idNo": "192837465",
      "fieldOfActivity": 103,
      "customsEffectiveDate": "2024-03-01T00:00:00",
      "customsExpiryDate": "2026-03-01T00:00:00",
      "digitalSignatureType": 2,
      "digitalSignature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx...",
      "serial": "5678901234",
      "provider": "Viettel",
      "effectiveDate": "2024-03-01T00:00:00",
      "expiryDate": "2026-03-01T00:00:00",
      "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk..."
    },
    {
      "fullName": "Pham Van E",
      "email": "phamvane@example.com",
      "idType": 1,
      "idNo": "564738291",
      "fieldOfActivity": 104,
      "customsEffectiveDate": "2024-04-01T00:00:00",
      "customsExpiryDate": "2026-03-31T00:00:00",
      "digitalSignatureType": 1,
      "digitalSignature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz...",
      "serial": "2345678901",
      "provider": "VNPT",
      "effectiveDate": "2024-04-01T00:00:00",
      "expiryDate": "2026-03-31T00:00:00",
      "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm..."
    },
    {
      "fullName": "Bui Thi F",
      "email": "buithif@example.com",
      "idType": 2,
      "idNo": "918273645",
      "fieldOfActivity": 105,
      "customsEffectiveDate": "2024-05-01T00:00:00",
      "customsExpiryDate": "2026-04-30T00:00:00",
      "digitalSignatureType": 2,
      "digitalSignature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAf...",
      "serial": "3456789012",
      "provider": "FPT",
      "effectiveDate": "2024-05-01T00:00:00",
      "expiryDate": "2026-04-30T00:00:00",
      "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAe..."
    }
  ];
  modalTitle: string = 'Thêm mới người khai hải quan';
  total: number = 0;
  paginate = {
    page: INIT_PAGE,//1
    size: INIT_SIZE,//10
  };
  paginateStart = 1;
  paginateEnd = 10;

  tableSize = CUSTOMER_TABLE_SIZE;
  formatDateTable = DATE_FORMAT.TABLE;
  isCollapsed: boolean = false;

  checked = false;
  indeterminate = false;

  listOfOption: Array<{ label: string; value: number }> = [
    {
      label: 'Vận chuyển',
      value: 1
    },
    {
      label: 'Xuất nhập khẩu',
      value: 2
    }
  ];

  isVisible = false;
  isVisibleModalCTS = false;
  isVisibleDownload = false;
  isOkLoading = false;

  radioValue = '1';
  optionFileStatuss = [
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đang tắt' },
  ];

  optionPaper = [
    { value: 1, label: 'CMND' },
    { value: 2, label: 'CCCD' },
    { value: 3, label: 'Hộ chiếu' },
  ];
  msAcc: string = '';
  listOfData: any = [];
  modalTitleDownload: string = 'Tải ứng dụng di động để đăng ký MySign';
  taxCode: string | null = null;
  searchKey: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  backupDataTable: any[] = [];

  setOfCheckedIndex = new Set<number>();
  listDataSelected: any[] = [];

  mode: 'view' | 'add' | 'edit' = 'add';

  constructor(
    private accReSrv: AccountRegisterService,
    private fb: FormBuilder,
    private notification: NotificationService,
    private dialogService: DialogService,
    private router: Router,
    private authSrv: AuthService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadFormValidateUserId();
    this.authSrv.taxCode$.subscribe(taxCode => {
        this.taxCode = taxCode;
        this.cdr.detectChanges();
    });

    this.searchSubject
      .pipe(debounceTime(1000))  // Đợi 1 giây sau khi dừng nhập
      .subscribe((searchText) => {
        this.filterList(searchText);  // Gọi hàm lọc khi hết thời gian chờ
      });
  }

  loadForm() {
    this.form = this.fb.group({
      representativeName: ['', [Validators.required]],
      representativeIdType: [2],
      representativeIdNo: ['', [Validators.required]],
      address: ['', [Validators.required]],
      fieldOfActivity: [null, [Validators.required]],
      proposal: [''],
      freeSoftware: ['0', [Validators.required]],
      ediSoftware: ['0'],
      numberComputer: [''],
      userCodeExpiryDate: ['']
    });

    this.form.get('numberComputer')?.disable();


    this.form.get('freeSoftware')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
    this.form.get('ediSoftware')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  loadFormValidateUserId() {
    this.formValidateUserId = this.fb.group({
      fullName: ['hehe', [Validators.required]],
      userId: [''],
      email: ['', [Validators.required, Validators.email]],
      fieldOfActivity: [null, [Validators.required]],
      idType: [2],
      idNo: ['', [Validators.required]],
      customsEffectiveDate: [''],
      customsExpiryDate: [''],
      digitalSignatureType: [this.radioValue],
      digitalSignature: [''],
      nameCert: [''],
      serial: [''],
      provider: [''],
      effectiveDate: [''],
      expiryDate: [''],
      publicKey: ['']
    }, { validator: this.dateRangeValidator('customsEffectiveDate', 'customsExpiryDate') })
    console.log(this.formValidateUserId.value)
  }

  dateRangeValidator(fromDateField: string, toDateField: string) {
    return (formGroup: AbstractControl) => {
      const fromDate = formGroup.get(fromDateField)?.value;
      const toDate = formGroup.get(toDateField)?.value;

      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        formGroup.get(fromDateField)?.setErrors({ dateRangeInvalid: true });
      } else {
        formGroup.get(fromDateField)?.setErrors(null);
      }
    };
  }

  getFromDateError(): string | undefined {
    const control = this.formValidateUserId.get('customsEffectiveDate');
      if (control?.touched) {
        if (control.errors?.['dateRangeInvalid']) {
          return 'Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực';
        }
      }

    return undefined;
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
      this.isVisibleModalCTS = false;
      this.formValidateUserId.get('digitalSignature')?.setValue(data.subjectDN);
      this.formValidateUserId.get('serial')?.setValue(data.serialNumber);
      this.formValidateUserId.get('provider')?.setValue(data.issuerDN);
      this.formValidateUserId.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom));
      this.formValidateUserId.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo));
      // this.formValidateUserId.get('nameCert')?.setValue(data.subjectDN);
      this.formValidateUserId.get('publicKey')?.setValue(data.subjectDN);//check
    }
  }

  disableForm() {
    this.formValidateUserId.get('digitalSignature')?.disable();
    this.formValidateUserId.get('serial')?.disable();
    this.formValidateUserId.get('provider')?.disable();
    this.formValidateUserId.get('effectiveDate')?.disable();
    this.formValidateUserId.get('expiryDate')?.disable();
    // this.formValidateUserId.get('nameCert')?.disable();
    this.formValidateUserId.get('publicKey')?.disable();
  }

  getIdNoValidateError(): string | undefined {
    const control = this.formValidateUserId.get('idNo');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Số CMND/CCCD/ Hộ chiếu không được để trống';
        }
      }

    return undefined;
  }

  getFieldOfActivityValidateError(): string | undefined {
    const control = this.formValidateUserId.get('fieldOfActivity');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Lĩnh vực hoạt động không được để trống';
        }
      }

    return undefined;
  }

  getEmailError(): string | undefined {
    const control = this.formValidateUserId.get('email');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Email không được để trống';
        }
        if (control.errors?.['email']) {
          return 'Email không đúng định dạng';
        }
      }

    return undefined;
  }

  getFullNameError(): string | undefined {
    const control = this.formValidateUserId.get('fullName');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Họ tên không được để trống';
        }
      }

    return undefined;
  }

  submit() {
    this.form.markAllAsTouched();
    if (!this.form.invalid) {
      this.register();
    }
    else {
      console.log('Form invalid')
    }
  }

  onSearch(searchText: string) {
    this.searchSubject.next(searchText);
  }

  filterList(searchText: string) {
    if (!searchText.toLowerCase().trim()) {
      this.dataTable = this.backupDataTable;
    }
    else {
      this.dataTable = this.dataTable.filter(data =>
        data.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        data.idNo.toLowerCase().includes(searchText.toLowerCase()) ||
        data.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  }

  calculateTotal(): void {
    const freeSoftwareValue = +this.form.value?.freeSoftware || 0;
    const ediSoftwareValue = +this.form.value?.ediSoftware || 0;
    const total = freeSoftwareValue + ediSoftwareValue;
    this.form.get('numberComputer')?.setValue(total);
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || charCode === 46 || charCode === 8) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  setDefaultValue(string: 'freeSoftware' | 'ediSoftware'): void {
    if (string === 'freeSoftware') {
      const currentValue = this.form.get('freeSoftware')?.value;
      if (!currentValue) {
        this.form.get('freeSoftware')?.setValue('0');
      }
    }
    else {
      const currentValue = this.form.get('ediSoftware')?.value;
      if (!currentValue) {
        this.form.get('ediSoftware')?.setValue('0');
      }
    }
    this.calculateTotal();
  }

  getFieldOfActivityError():string | undefined {
    const control = this.form.get('fieldOfActivity');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Lĩnh vực hoạt động không được để trống';
        }
      }

    return undefined;
  }

  getRepresentativeError(): string | undefined {
    const control = this.form.get('representativeName');
    if (control?.touched) {
      if (control.errors?.['required']) {
        return 'Tên người đại diện không được để trống';
      }
    }

    return undefined;
  }

  getIdNoError(): string | undefined {
    const control = this.form.get('representativeIdNo');
    if (control?.touched) {
      if (control.errors?.['required']) {
        return 'Số CMND/CCCD/ Hộ chiếu không được để trống';
      }
    }

    return undefined;
  }

  //allow Aa-Za, 0-9
  allowAlphaNumeric(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) ||
        (charCode >= 97 && charCode <= 122) ||
        (charCode >= 48 && charCode <= 57) ||
        charCode === 8) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  getBusinessAddressError():string | undefined {
    const control = this.form.get('address');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Địa chỉ doanh  nghiệp không được để trống';
        }
      }

    return undefined;
  }

  showModalUserId(mode: 'add' | 'view' | 'edit', data: any) {
    this.isVisible = true;
    this.formValidateUserId.enable();
    if (mode === 'add') {
      this.modalTitle = 'Thêm mới người khai hải quan';
      this.mode = 'add';
      this.formValidateUserId.reset();
      this.disableForm();

    }
    if (mode === 'edit') {
      this.modalTitle = 'Chỉnh sửa người khai hải quan';
      this.mode = 'edit';
      this.formValidateUserId.reset();
      //apply data
      this.setValueForm(data);
      this.disableForm();
    }
    if (mode === 'view') {
      this.modalTitle = 'Xem chi tiết người khai hải quan';
      this.mode = 'view';
      this.formValidateUserId.reset();
      //appy data
      this.setValueForm(data);
      this.formValidateUserId.disable();
    }
  }

  setValueForm(data: any) {
    this.formValidateUserId.get('fullName')?.setValue(data?.fullName)
    this.formValidateUserId.get('UserId')?.setValue('hehe')
      this.formValidateUserId.get('email')?.setValue(data?.email)
      this.formValidateUserId.get('fieldOfActivity')?.setValue(1)
      this.formValidateUserId.get('idType')?.setValue(data?.idType)
      this.formValidateUserId.get('idNo')?.setValue(data?.idNo)
      this.formValidateUserId.get('customsEffectiveDate')?.setValue(data?.customsEffectiveDate)
      this.formValidateUserId.get('customsExpiryDate')?.setValue(data?.customsExpiryDate)
      this.formValidateUserId.get('digitalSignatureType')?.setValue(data?.digitalSignatureType)
      this.formValidateUserId.get('digitalSignature')?.setValue(data?.digitalSignature)
      this.formValidateUserId.get('nameCert')?.setValue(data?.nameCert)
      this.formValidateUserId.get('serial')?.setValue(data?.serial)
      this.formValidateUserId.get('provider')?.setValue(data?.provider)
      this.formValidateUserId.get('effectiveDate')?.setValue(data?.effectiveDate)
      this.formValidateUserId.get('expiryDate')?.setValue(data?.expiryDate)
      this.formValidateUserId.get('publicKey')?.setValue(data?.publicKey)
  }

  submitValidateUserId() {
    this.formValidateUserId.markAllAsTouched();
    if (!this.formValidateUserId.invalid) {
      if (this.mode === 'add') {
        this.validateUserId();
      }
      else if(this.mode === 'edit'){
        //edit
        this.editUserId();
      }
    }
    else {
      console.log('Form invalid');
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  showModalCTS() {
    this.isVisibleModalCTS = true;
    this.msAcc = '';
    this.listOfData = [];
  }

  handleCancelCTS() {
    this.isVisibleModalCTS = false;
  }

  showModalDownload() {
    this.isVisibleModalCTS = false;
    this.isVisibleDownload = true;
  }

  handleCancelDownload() {
    this.isVisibleDownload = false;
  }

  editUserId() {
    const body = {
      userId: this.formValidateUserId.value.userId,
      fullName: this.formValidateUserId.value.fullName,
      email: this.formValidateUserId.value.email,
      idType: this.formValidateUserId.value.idType,
      idNo: this.formValidateUserId.value.idNo,
      fieldOfActivity: this.formValidateUserId.value.fieldOfActivity?.[0],
      customsEffectiveDate: this.convertDateTimestamp(this.formValidateUserId.value.customsEffectiveDate),
      customsExpiryDate: this.convertDateTimestamp(this.formValidateUserId.value.customsExpiryDate),

      digitalSignatureType: this.formValidateUserId.getRawValue().digitalSignatureType,
      digitalSignature: this.formValidateUserId.getRawValue().digitalSignature,
      serial: this.formValidateUserId.getRawValue().serial,
      provider: this.formValidateUserId.getRawValue().provider,
      effectiveDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().effectiveDate),
      expiryDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().expiryDate),
      publicKey: this.formValidateUserId.getRawValue().publicKey,
    }
    console.log(body)
  }

  validateUserId() {
    const body = {
      userId: this.formValidateUserId.value.userId,
      fullName: this.formValidateUserId.value.fullName,
      email: this.formValidateUserId.value.email,
      idType: this.formValidateUserId.value.idType,
      idNo: this.formValidateUserId.value.idNo,
      fieldOfActivity: this.formValidateUserId.value.fieldOfActivity?.[0],
      customsEffectiveDate: this.convertDateTimestamp(this.formValidateUserId.value.customsEffectiveDate),
      customsExpiryDate: this.convertDateTimestamp(this.formValidateUserId.value.customsExpiryDate),

      digitalSignatureType: this.formValidateUserId.getRawValue().digitalSignatureType,
      digitalSignature: this.formValidateUserId.getRawValue().digitalSignature,
      serial: this.formValidateUserId.getRawValue().serial,
      provider: this.formValidateUserId.getRawValue().provider,
      effectiveDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().effectiveDate),
      expiryDate: this.convertDateTimestamp(this.formValidateUserId.getRawValue().expiryDate),
      publicKey: this.formValidateUserId.getRawValue().publicKey,
    }
    // console.log(this.formValidateUserId.value.fullName)

//     this.accReSrv.checkRegisterUserId(body).subscribe((res: any) => {
//       if (res) {
//         if (res.success) {
//           this.isVisible = false;
//           //add data to table
//           this.dataTable = [...this.dataTable, body];
//           console.log(this.dataTable)
//           this.backupDataTable = this.dataTable;
//           this.cdr.detectChanges();
//         }
//     }
// })
  }

  getCTS() {
    if(this.msAcc === '') {
      this.notification.error('Vui lòng nhập tài khoản MySign để lấy chứng thư số')
    }
    this.accReSrv.getCertInfo(this.msAcc).subscribe((res: any) => {
      if(res && res.message === 'success') {
        this.listOfData = res.data;
      }
      else {
        this.notification.error('Có lỗi xảy ra khi kết nối với hệ thống Viettel - MySign. Vui lòng thử lại hoặc liên hệ quản trị viên')
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

  convertComplexDateString(dateStr: string): number {
    // Chuyển chuỗi 'YYYYMMDDHHmmss±zzzz' thành định dạng ISO 8601
    const isoFormattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}${dateStr.slice(14)}`;

    // Tạo đối tượng Date từ chuỗi đã định dạng
    const dateObj = new Date(isoFormattedDate);

    // Trả về timestamp (số milliseconds từ epoch)
    return dateObj.getTime();
  }

  convertDateTimestamp(date: any) {
  if (typeof date === 'string') {
    const [d, m, y] = date.split(/-|\//);
    const dateNew = new Date(Number(y), Number(m) - 1, Number(d));
    return dateNew.getTime();
  } else if (date instanceof Date) {
    return date.getTime();
  } else {
    throw new Error('Invalid date format');
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

  copyText(): void {
    const inputElement = document.getElementById('copyInput') as HTMLInputElement;
    if (inputElement) {
      inputElement.select();
      inputElement.setSelectionRange(0, 99999);
      document.execCommand('copy');
      this.notification.success('Đã sao chép đường dẫn');
    }
  }

  handleOkDownload() {
    this.isVisibleDownload = false;
    // this.router.navigate(['vnaccs/register']);
  }

  updatePaginateRange() {
  this.paginateStart = (this.paginate.page - 1) * this.paginate.size + 1;
  this.paginateEnd = Math.min(this.paginate.page * this.paginate.size, this.total);
}

  disabledDate = (current: Date): boolean => {
    return current && current > new Date();
  };

  pageChange(page: number) {
    this.paginate.page = page;
    this.checked = false;
    this.indeterminate = false;
  }

  sizeChange(size: number) {
    this.paginate = {
      page: INIT_PAGE,
      size: size,
    };
  }

  updateCheckedSet(index: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedIndex.add(index);
      const selectedItem = this.dataTable[index];
      if (selectedItem) {
        this.listDataSelected.push(selectedItem);
      }
    } else {
      this.setOfCheckedIndex.delete(index);
      this.listDataSelected = this.listDataSelected.filter((_, i) => i !== index);
    }
  }

  refreshCheckedStatus(): void {
    const totalItems = this.dataTable.length;
    const checkedItems = this.setOfCheckedIndex.size;
    this.checked = totalItems > 0 && checkedItems === totalItems;
    this.indeterminate = checkedItems > 0 && checkedItems < totalItems;
  }

  onAllChecked(value: boolean): void {
    this.setOfCheckedIndex.clear();
    this.listDataSelected = [];
    this.dataTable.forEach((_, index) => this.updateCheckedSet(index, value));
    this.refreshCheckedStatus();
  }

  onItemChecked(index: number, checked: boolean): void {
    this.updateCheckedSet(index, checked);
    this.refreshCheckedStatus();
  }

  deleteMany() {
    console.log(this.listDataSelected)
    const dataDialog = {
      title: 'Bạn có muốn xoá User ID đã chọn không?',
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
    dialogRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.dataTable = this.dataTable.filter((_, index) => !this.setOfCheckedIndex.has(index));
        this.setOfCheckedIndex.clear();
        this.listDataSelected = [];
        this.refreshCheckedStatus();
      }
    })
  }

  deleteItem(index: number): void {
    const dataDialog = {
      title: 'Bạn có muốn xoá User ID đã chọn không?',
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
    dialogRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.dataTable.splice(index, 1);
        this.setOfCheckedIndex.delete(index);
        this.listDataSelected = this.listDataSelected.filter((_, i) => i !== index);
        this.refreshCheckedStatus();
      }
    })
}


  register() {
    const dataDialog = {
      title: 'Bạn có muốn đăng ký mới thông tin doanh nghiệp không?',
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
          taxCode: this.taxCode,
          representativeName: this.form.value.representativeName,
          representativeIdType: this.form.value.representativeIdType,
          representativeIdNo: this.form.value.representativeIdNo,
          address: this.form.value.address,
          fieldOfActivity: this.form.value.fieldOfActivity?.[0],
          proposal: this.form.value.proposal,
          freeSoftware: this.form.value.freeSoftware,
          ediSoftware: this.form.value.ediSoftware,
          edifactSoftware: this.form.value.ediSoftware,
          userCodeExpiryDate: this.convertDateTimestamp(this.form.value.userCodeExpiryDate),
          userIdRequestList: this.dataTable
        }
        console.log(body)

        //get ID from token
        const token:any =
        localStorage?.getItem(STORAGE_KEYS.TOKEN) ||
        sessionStorage?.getItem(STORAGE_KEYS.TOKEN);
        if (token) {

        }

        this.accReSrv.register(35, body).subscribe((res: any) => {
          if (res) {
            if (res.success) {
              this.notification.success(res.message);
              this.router.navigate(['/vnaccs/home'])
            }
          }
        })
      }
    })
  }
}
