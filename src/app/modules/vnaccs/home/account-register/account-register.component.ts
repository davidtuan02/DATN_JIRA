import { Component } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
    CommonModule
  ]
})

export class AccountRegisterComponent {
  taxCode: string = '';
  optionRepresent = [
    {
      value: 1,
      label: '1'
    },
    {
      value: 2,
      label: '2'
    },
  ]
  dateFormat = DATE_FORMAT.COMMON;
  size: NzButtonSize = 'large';

  form!: FormGroup;
  formAddFile!: FormGroup;

  viewMode = false;
  editMode = false;
  addMode = false;

  passwordVisible = false;
  password?: string;

  selectedValue = null;
  optionFileStatus = FILE_STATUS;
  optionFileType = FILE_TYPE;


  dataTable: any[] = [];
  modalTitle: string = '';
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

  constructor(
    private accReSrv: AccountRegisterService
  ) { }

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
    const body = {
      "taxCode": "123456789",
      "representativeName": "Nguyen Van A",
      "representativeIdType": 1,
      "representativeIdNo": "0123456789",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "fieldOfActivity": 101,
      "proposal": "Đề nghị sử dụng phần mềm",
      "freeSoftware": 1,
      "ediSoftware": 1,
      "edifactSoftware": 0,
      "userCodeExpiryDate": "2025-12-31T00:00:00",
      "userIdRequestList": [
        {
          "fullName": "Tran Van e",
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
        }
  ]
}

    this.accReSrv.register(35, body).subscribe((res: any) => {
      if (res) {
        console.log(res)
      }
    })
  }
}
