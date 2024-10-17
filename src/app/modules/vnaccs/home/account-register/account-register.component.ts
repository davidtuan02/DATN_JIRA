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
  selectedRepresentative = 2;
  dateFormat = DATE_FORMAT.COMMON;
  size: NzButtonSize = 'large';
  form!: FormGroup;
  formValidateUserId!: FormGroup;

  selectedValue = null;
  optionFileStatus = FILE_STATUS;
  optionFileType = FILE_TYPE;

  dataTable: any[] = [];
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
  setOfCheckedId = new Set<number>();
  listDataSelected: any[] = [];

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

  constructor(
    private accReSrv: AccountRegisterService,
    private fb: FormBuilder,
    private notification: NotificationService,
    private dialogService: DialogService,
    private router: Router,
    private authSrv: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadForm();
    this.loadFormValidateUserId();
  }

  ngOnInit(): void {
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
    const body = {
          "userId": "",
          "fullName": "sdfsdf",
          "email": "a@gmail.com",
          "idType": 1,
          "idNo": "123432",
          "fieldOfActivity": 1,
          "customsEffectiveDate": "2022-04-05",
          "customsExpiryDate": "2033-04-05",

          "digitalSignatureType": 1,
          "digitalSignature": "123432",
          "serial": "sdfsdf",
          "provider": "sdfsdf",
          "effectiveDate": "2023-04-05",
          "expiryDate": "2033-04-05",
          "publicKey": "Sdfsdf"
        };
    this.formValidateUserId = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      fieldOfActivity: [null, [Validators.required]],
      idType: [2],
      idNo: ['', [Validators.required]],
      customsEffectiveDate: [''],
      customsExpiryDate: ['']
    }, {validator: this.validateDate.bind(this)})
  }

  validateDate(control: AbstractControl){

  }

  getIdNoValidateError(): string | undefined {
    const control = this.form.get('idNo');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Số CMND/CCCD/ Hộ chiếu không được để trống';
        }
      }

    return undefined;
  }

  getFieldOfActivityValidateError(): string | undefined {
    const control = this.form.get('fieldOfActivity');
      if (control?.touched) {
        if (control.errors?.['required']) {
          return 'Lĩnh vực hoạt động không được để trống';
        }
      }

    return undefined;
  }

  getEmailError(): string | undefined {
    const control = this.form.get('email');
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
    const control = this.form.get('fullName');
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
    console.log('Lọc danh sách với từ khóa:', searchText);
    //search
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

  add() {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  showModalCTS() {
    this.isVisibleModalCTS = true;
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

  validateUserId() {
    const body = {
          "userId": "",
          "fullName": "sdfsdf",
          "email": "a@gmail.com",
          "idType": 1,
          "idNo": "123432",
          "fieldOfActivity": 1,
          "customsEffectiveDate": "2022-04-05",
          "customsExpiryDate": "2033-04-05",

          "digitalSignatureType": 1,
          "digitalSignature": "123432",
          "serial": "sdfsdf",
          "provider": "sdfsdf",
          "effectiveDate": "2023-04-05",
          "expiryDate": "2033-04-05",
          "publicKey": "Sdfsdf"
        };
        this.accReSrv.checkRegisterUserId(body).subscribe((res: any) => {
          if (res) {
            if (res.success) {
              this.isVisible = false;
              //add data to table
              this.dataTable = [...this.dataTable, body];
              this.cdr.detectChanges();
            }
        }
    })
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
      this.form.get('serial')?.setValue(data.serialNumber);
      this.form.get('provider')?.setValue(data.issuerDN);
      this.form.get('effectiveDate')?.setValue(this.formatDateFromString(data.validFrom));
      this.form.get('expiryDate')?.setValue(this.formatDateFromString(data.validTo));
      this.form.get('nameCert')?.setValue(data.subjectDN);
      this.form.get('publicKey')?.setValue(data.subjectDN);//check
      // this.loginForm.enable()
      // this.disableForm();
    }
  }

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
    const [d, m, y] = date.split(/-|\//); // splits "26-02-2012" or "26/02/2012"
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

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
      const selectedItem = this.dataTable.find(item => item.id === id);
      if (selectedItem) {
        this.listDataSelected.push(selectedItem);
      }
    } else {
      this.setOfCheckedId.delete(id);
      this.listDataSelected = this.listDataSelected.filter(item => item.id !== id);
    }
  }

  refreshCheckedStatus(): void {
    const totalItems = this.dataTable.length;
    const checkedItems = this.setOfCheckedId.size;
    this.checked = totalItems > 0 && checkedItems === totalItems;
    this.indeterminate = checkedItems > 0 && checkedItems < totalItems;
  }

  onAllChecked(value: boolean): void {
    this.setOfCheckedId.clear();
    this.listDataSelected = [];
    this.dataTable.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
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
        // const body = {
        //   "taxCode": "123456789", -----
        //   "representativeName": "Nguyen Van A",
        //   "representativeIdType": 1,
        //   "representativeIdNo": "0123456789",
        //   "address": "123 Đường ABC, Quận 1, TP.HCM",
        //   "fieldOfActivity": 101,
        //   "proposal": "Đề nghị sử dụng phần mềm",
        //   "freeSoftware": 1,
        //   "ediSoftware": 1,
        //   "edifactSoftware": 0,--------
        //   "userCodeExpiryDate": "2025-12-31T00:00:00",
        //   "userIdRequestList": [--------
        //     {
        //       "fullName": "Tran Van e",
        //       "email": "tranvanb@example.com",
        //       "idType": 1,
        //       "idNo": "987654321",
        //       "fieldOfActivity": 101,
        //       "customsEffectiveDate": "2024-01-01T00:00:00",
        //       "customsExpiryDate": "2025-12-31T00:00:00",
        //       "digitalSignatureType": 2,
        //       "digitalSignature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...",
        //       "serial": "1234567890",
        //       "provider": "VNPT",
        //       "effectiveDate": "2024-01-01T00:00:00",
        //       "expiryDate": "2025-12-31T00:00:00",
        //       "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr..."
        //     }
        //   ]
        // };



        const body = {
          taxCode: this.taxCode,
          representativeName: this.form.value.representativeName,
          representativeIdType: this.form.value.representativeIdType,
          representativeIdNo: this.form.value.representativeIdNo,
          address: this.form.value.address,
          fieldOfActivity: this.form.value.fieldOfActivity,
          proposal: this.form.value.proposal,
          freeSoftware: this.form.value.freeSoftware,
          ediSoftware: this.form.value.ediSoftware,
          // edifactSoftware: this.form.value.edifactSoftware,
          userCodeExpiryDate: this.convertDateTimestamp(this.form.value.userCodeExpiryDate),
          userIdRequestList: this.listOfData
        }
        console.log(body)

        //get ID from token
        const token:any =
        localStorage?.getItem(STORAGE_KEYS.TOKEN) ||
        sessionStorage?.getItem(STORAGE_KEYS.TOKEN);
        if (token) {

        }

        // this.accReSrv.register(35, body).subscribe((res: any) => {
        //   if (res) {
        //     // console.log(res)
        //     if (res.success) {
        //       this.notification.success(res.message);
        //       this.router.navigate(['/vnaccs/home'])
        //     }
        //   }
        // })
      }
    })
  }
}
