// common-modal.component.ts
import { ApplicationRef, Component, HostListener, Inject, Input } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent {
  count = 0;
  constructor(
    public modalRef: NzModalRef,
    private ref: ApplicationRef,
    @Inject(NZ_MODAL_DATA) public dialogData: any,
    public commonService: CommonService
  ) {}

  // @HostListener('document:keydown.enter', ['$event'])
  // handleEnterKey(event: KeyboardEvent) {
  //   event.preventDefault();
  //   this.accept();
  // }

  accept() {
    this.modalRef.close(true);
    this.ref.tick();
  }
  closePopup() {
    this.modalRef.destroy();
    this.ref.tick();
  }
  ngOnDestroy(): void {
    this.modalRef.destroy();
    this.modalRef.close();
  }
}
