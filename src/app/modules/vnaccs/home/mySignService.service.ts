import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})

export class MySignService {
  isWaitingMySign: boolean = false;

  constructor() {
  }

  show() {
    this.isWaitingMySign = true;
  }

  hide() {
    this.isWaitingMySign = false;
  }

}
