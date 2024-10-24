import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { NzStepsModule } from 'ng-zorro-antd/steps'

@Component({
  selector: 'app-send-custom',
  templateUrl: './send-custom.component.html',
  styleUrls: ['./send-custom.component.scss'],
  standalone: true,
  imports: [NzStepsModule, CommonModule]
})
export class SendCustomComponent {
  current = 0

  index = 'First-content'

  pre(): void {
    this.current -= 1
    this.changeContent()
  }

  next(): void {
    this.current += 1
    this.changeContent()
  }

  done(): void {
    console.log('done')
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 'First-content'
        break
      }
      case 1: {
        this.index = 'Second-content'
        break
      }
      default: {
        this.index = 'error'
      }
    }
  }
  constructor() {}
}
