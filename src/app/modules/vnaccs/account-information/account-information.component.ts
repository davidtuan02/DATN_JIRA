import {Component, OnInit} from '@angular/core';
import {STORAGE_KEYS} from "../../../shared/constants/system.const";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AccountInformationService} from "./account-information.service";
import {NgForOf, NgIf} from "@angular/common";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzFormDirective} from "ng-zorro-antd/form";
import {NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {NzRadioComponent, NzRadioGroupComponent} from "ng-zorro-antd/radio";
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";
import {AdminAccountInfoComponent} from "./admin-account-info/admin-account-info.component";

@Component({
  selector: 'app-account-information',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NzColDirective,
    NzFormDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzOptionComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
    NzRowDirective,
    NzSelectComponent,
    ReactiveFormsModule,
    RouterLink,
    NzTabSetComponent,
    NzTabComponent,
    AdminAccountInfoComponent
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss'
})
export class AccountInformationComponent implements OnInit {
  taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE);
  constructor() {
  }

  ngOnInit() {
  }

}
