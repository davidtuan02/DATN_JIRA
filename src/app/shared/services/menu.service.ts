import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class MenuService {
  private selectedMenu = new BehaviorSubject<String>('')
  selectedMenu$ = this.selectedMenu.asObservable()
  constructor() {}
  setSelectedMenu(menu: String) {
    this.selectedMenu.next(menu)
  }
}
