import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPasswordMask]',
  standalone: true
})
export class PasswordMaskDirective {
  private actualValue: string = ''; // Lưu giá trị thực sự

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // Lắng nghe sự kiện nhập liệu
  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent): void {
    const input = this.el.nativeElement;
    const displayedValue = input.value;

    if (displayedValue.length > this.actualValue.length) {
      const newChar = displayedValue.slice(this.actualValue.length);
      this.actualValue += newChar;
    } else {
      this.actualValue = this.actualValue.slice(0, displayedValue.length);
    }

    // Hiển thị dưới dạng *
    input.value = '*'.repeat(this.actualValue.length);

    // Thay đổi màu và độ đậm khi người dùng nhập
    this.renderer.setStyle(input, 'color', '#000000');
    this.renderer.setStyle(input, 'font-weight', 'bold');
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = this.el.nativeElement;
    input.value = '*'.repeat(this.actualValue.length);
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event): void {
    const input = this.el.nativeElement;
    input.value = this.actualValue;
  }
}
