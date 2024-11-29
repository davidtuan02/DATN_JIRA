import { Component, Input, OnInit, SimpleChanges } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DatePipe, NgIf } from '@angular/common'
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid'
import { NzFormDirective } from 'ng-zorro-antd/form'
import { NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective } from 'ng-zorro-antd/input'
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio'
import { STORAGE_KEYS } from '../../../../shared/constants/system.const'
import { Router, RouterLink } from '@angular/router'
import { AccountInformationService } from '../account-information.service'
import { AutoTrimDirective } from '../../../../shared/directives/trim.directive'
import { MenuService } from '../../../../shared/services/menu.service'
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
    AutoTrimDirective
  ],
  providers: [DatePipe],
  templateUrl: './admin-account-info.component.html',
  styleUrl: './admin-account-info.component.scss'
})
export class AdminAccountInfoComponent implements OnInit {
  form: FormGroup
  @Input() data!: any

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private accountInfoService: AccountInformationService,
    private datePipe: DatePipe,
    public menuSrv: MenuService
  ) {
    this.form = this.fb.group({
      taxCode: [null],
      email: [null],
      digitalSignatureType: ['1'],
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

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      // console.log('Data received in child component:', this.data)
      this.form.patchValue({
        taxCode: this.data.taxCode,
        email: this.data.email,
        digitalSignatureType: this.data.digitalSignatureType.toString(),
        digitalSignature: this.data.digitalSignature,
        serial: this.data.serial,
        provider: this.data.provider,
        effectiveDate: this.datePipe.transform(this.data.effectiveDate, 'dd/MM/yyyy'),
        expiryDate: this.datePipe.transform(this.data.expiryDate, 'dd/MM/yyyy'),
        publicKey: this.data.publicKey,
        nameCert: this.data.digitalSignature,
        taxCodeCTS: this.data.taxCodeCTS,
        credentialId: this.data.credentialId
      })
      this.form.disable()
    }
  }
}
