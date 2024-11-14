import {
  Directive,
  OnChanges,
  Input,
  ElementRef,
  Renderer2,
  SimpleChanges,
  OnInit,
  OnDestroy,
  Optional
} from '@angular/core'
import { NgModel, ControlContainer } from '@angular/forms'

@Directive({
  selector: '[clearInput]',
  standalone: true,
  exportAs: 'clearInput'
})
export class ClearInputDirective implements OnChanges, OnInit, OnDestroy {
  @Input('clearInput') inputValue: any
  private clearButton!: HTMLElement
  private clearButtonClickListener!: () => void

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional() private model: NgModel, // Optional injection for safer fallback
    @Optional() private controlContainer: ControlContainer
  ) {}

  ngOnInit() {
    // Ensure `model` is defined; if not, log or handle accordingly
    if (!this.model && !this.controlContainer) {
      console.error('NgModel or ControlContainer is required')
      return
    }

    // Create a clear button (the "X" icon) and add it to the DOM
    this.clearButton = this.renderer.createElement('span')
    this.renderer.setStyle(this.clearButton, 'display', 'none')
    this.renderer.setStyle(this.clearButton, 'cursor', 'pointer')
    this.clearButton.innerHTML = '&times;'

    // Add a click event to clear the input value
    this.clearButtonClickListener = this.renderer.listen(this.clearButton, 'click', () => {
      this.model?.control.reset()
      this.renderer.setStyle(this.clearButton, 'display', 'none')
    })

    // Append the clear button as a sibling of the input element
    this.renderer.appendChild(this.el.nativeElement.parentNode, this.clearButton)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputValue']) {
      if (this.inputValue) {
        this.renderer.setStyle(this.clearButton, 'display', 'inline')
      } else {
        this.renderer.setStyle(this.clearButton, 'display', 'none')
      }
    }
  }

  ngOnDestroy() {
    if (this.clearButtonClickListener) {
      this.clearButtonClickListener()
    }
  }
}
