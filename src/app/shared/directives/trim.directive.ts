import { AfterContentInit, Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[autoTrim]',
  standalone: true,
})
export class AutoTrimDirective {
  constructor(
    private el: ElementRef,
    @Optional() private ngControl: NgControl,
  ) {}

  @HostListener('blur') onBlur() {
    this.ngControl.control?.setValue(this.el.nativeElement.value.trim());
  }
}


