import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DatePipe, NgIf} from "@angular/common";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzFormDirective} from "ng-zorro-antd/form";
import {NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective} from "ng-zorro-antd/input";
import {NzRadioComponent, NzRadioGroupComponent} from "ng-zorro-antd/radio";
import {STORAGE_KEYS} from "../../../../shared/constants/system.const";
import {Router, RouterLink} from "@angular/router";
import {AccountInformationService} from "../account-information.service";
@Component({
  selector: 'app-admin-account-info',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NzColDirective,
    NzFormDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzRadioComponent,
    NzRadioGroupComponent,
    NzRowDirective,
    ReactiveFormsModule,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './admin-account-info.component.html',
  styleUrl: './admin-account-info.component.scss',
})
export class AdminAccountInfoComponent implements OnInit {
  taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)!;
  token = localStorage.getItem(STORAGE_KEYS.TOKEN)!;
  form: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private accountInfoService: AccountInformationService,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      taxCode: [null],
      email: [null],
      digitalSignatureType: ["1"],
      digitalSignature: [null],
      serial: [null],
      provider: [null],
      effectiveDate: [null],
      expiryDate: [null],
      publicKey: [null],
      nameCert: [null],
      taxCodeCTS: [null],
      credentialId: [null]
    })
  }

  ngOnInit() {
    const id = this.decodeToken(this.token).sub;
    this.accountInfoService.getAdminInfo(id).subscribe((res: any) => {
      this.form.patchValue({
        taxCode: res.data.taxCode,
        email: res.data.email,
        digitalSignatureType: res.data.digitalSignatureType.toString(),
        digitalSignature: res.data.digitalSignature,
        serial: res.data.serial,
        provider: res.data.provider,
        effectiveDate: this.datePipe.transform(res.data.effectiveDate, "dd/MM/yyyy"),
        expiryDate: this.datePipe.transform(res.data.expiryDate, "dd/MM/yyyy"),
        publicKey: res.data.publicKey,
        nameCert: res.data.nameCert,
        taxCodeCTS: res.data.taxCodeCTS,
        credentialId: res.data.credentialId
      })
    })
    this.form.disable();
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
}
