import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import moment from 'moment';

export class CustomValidator {

  static test(username: string): ValidatorFn {
    return (formGroup: AbstractControl) => {
      const control = formGroup.get(username);
      if (!control) {
        return null; // Nếu không tìm thấy control, trả về null
      }

      // Kiểm tra điều kiện của bạn
      if (control.value && control.value.length < 5) { // Ví dụ: yêu cầu tối thiểu 5 ký tự
        control.setErrors({ customError: 'Tên đăng nhập phải có ít nhất 5 ký tự' }); // Thiết lập lỗi
      } else {
        control.setErrors(null); // Xóa lỗi nếu không có lỗi
      }

      return null; // Trả về null nếu không có lỗi
    };
  }


  static rangeDate(controlFromName: string, controlToName: string) {
    return (formGroup: AbstractControl) => {
      const controlFrom = formGroup.get(controlFromName);
      const controlTo = formGroup.get(controlToName);
      if (!controlFrom || !controlTo) return null;

      if (
        controlFrom?.value &&
        controlTo?.value &&
        controlFrom?.value > controlTo?.value
      ) {
        controlFrom.setErrors({ rangeDate: true });
        controlTo.setErrors({ rangeDate: true });
      } else {
        controlFrom.setErrors(null);
        controlTo.setErrors(null);
      }
      return null;
    };
  }

  static phoneNunmber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (!value?.startsWith('0') && !value?.startsWith('84')) {
        return { phonePrefix: true };
      } else if (value?.startsWith('0') && value.length !== 10) {
        return /^[0-9]{10}$/.test(value) ? null : { phoneFormat0: true };
      } else if (value?.startsWith('84') && value.length !== 11) {
        return /^84[0-9]{9}$/.test(value) ? null : { phoneFormat84: true };
      }
      return null;
    };
  }

  static compareCurrentDate(mode: 'less' | 'more'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      let isInvalid = false;
      if (mode === 'less') {
        isInvalid = moment(value).isBefore(moment());
      } else if (mode === 'more') {
        isInvalid = moment(value).isAfter(moment());
      }

      return isInvalid ? { compareCurrentDate: true } : null;
    };
  }

  static arrayEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) return null;
      const isInvalid = value
        .split(',')
        .find((str) =>
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str.trim()) ? false : true
        );
      return isInvalid ? { pattern: true } : null;
    };
  }
}
