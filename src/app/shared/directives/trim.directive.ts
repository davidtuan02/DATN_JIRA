import { Directive, ElementRef, HostListener } from '@angular/core'

@Directive({
  selector: 'input',
  standalone: true
})
export class TrimSpaceDirective {
  constructor(private el: ElementRef) {}

  @HostListener('blur')
  onBlur() {
    const value: string = this.el.nativeElement.value
    this.el.nativeElement.value = value.trim()
  }
}
