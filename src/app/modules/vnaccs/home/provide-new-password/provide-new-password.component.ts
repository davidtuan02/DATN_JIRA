import { Component, OnInit } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms'
import { NzModalFooterDirective, NzModalRef } from 'ng-zorro-antd/modal'
import { PASSWORD_REGEX } from '../../../../shared/constants/regex.const'
import { NzFormDirective } from 'ng-zorro-antd/form'
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid'
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select'
import { NgForOf, NgIf, registerLocaleData } from '@angular/common'
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input'
import { NzIconDirective } from 'ng-zorro-antd/icon'
import { NzButtonComponent } from 'ng-zorro-antd/button'
import { HomeService } from '../home.service'
import { STORAGE_KEYS } from '../../../../shared/constants/system.const'
import { AutoTrimDirective } from '../../../../shared/directives/trim.directive'
import vi from '@angular/common/locales/vi'
registerLocaleData(vi)

@Component({
  selector: 'app-provide-new-password',
  standalone: true,
  imports: [
    NzFormDirective,
    ReactiveFormsModule,
    NzRowDirective,
    NzColDirective,
    NzSelectComponent,
    NzOptionComponent,
    NgForOf,
    NzInputDirective,
    NzInputGroupComponent,
    NzIconDirective,
    NzModalFooterDirective,
    NzButtonComponent,
    NgIf,
    AutoTrimDirective
  ],
  templateUrl: './provide-new-password.component.html',
  styleUrl: './provide-new-password.component.scss'
})
export class ProvideNewPasswordComponent implements OnInit {
  form: FormGroup = new FormGroup({})
  listUserId: any = []
  passwordVisible: boolean = false
  rePasswordVisible: boolean = false

  constructor(private fb: FormBuilder, private ref: NzModalRef, private homeService: HomeService) {
    this.buildForm()
  }

  ngOnInit() {
    const taxCode = localStorage.getItem(STORAGE_KEYS.TAX_CODE)!
    this.homeService.getListUserId(taxCode).subscribe((res: any) => {
      this.listUserId = res.data
    })
  }

  buildForm() {
    this.form = this.fb.group(
      {
        userid: [null, Validators.required],
        password: [null, Validators.compose([Validators.required, Validators.pattern(PASSWORD_REGEX)])],
        rePassword: [null, [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    )

    this.form.valueChanges.subscribe(() => {
      Object.keys(this.form.controls).forEach((controlName) => {
        const control = this.form.get(controlName)
        if (control?.value && !control.touched) {
          control.markAsTouched()
        }
      })
    })
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl
  }

  get rePassword(): FormControl {
    return this.form.get('rePassword') as FormControl
  }

  getConfirmPassError(): string | undefined {
    const control = this.form.get('rePassword')

    const trimmedValue = control?.value?.trim()
    if (control && control.value !== trimmedValue) {
      control.setValue(trimmedValue, { emitEvent: false })
    }

    if ((control?.touched || control?.dirty) && control?.touched) {
      if (control.errors?.['required']) {
        return 'Xác nhận lại mật khẩu không được để trống'
      }
      if (control.errors?.['passwordMismatch']) {
        return 'Xác nhận lại mật khẩu phải giống mật khẩu đã nhập'
      }
    }
    return undefined
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value
    const rePassword = control.get('rePassword')?.value

    if (rePassword && password !== rePassword) {
      control.get('rePassword')?.setErrors({ passwordMismatch: true })
    }
    // Return error if passwords do not match
    return rePassword && password !== rePassword ? { passwordMismatch: true } : null
  }

  onCloseModal() {
    this.ref.close(false)
  }

  onUpdate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.ref.close(this.form.getRawValue())
  }

  getControlError(name: string) {
    return this.form.get(name)?.errors && (this.form.get(name)?.touched || this.form.get(name)?.dirty)
  }
}
