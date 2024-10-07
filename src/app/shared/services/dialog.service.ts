import {
  ApplicationRef,
  Injectable,
  TemplateRef,
  Type
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private modal: NzModalService,
    private translate: TranslateService,
    private ref: ApplicationRef
  ) {}
  openDialog<T>(
    component: string | TemplateRef<NzSafeAny> | Type<T>,
    title?: string,
    dialogData?: any,
    option: ModalOptions = {}
  ): NzModalRef {
    return this.modal.create({
      nzContent: component,
      nzCentered: true,
      nzFooter: null,
      nzKeyboard: false,
      nzMaskClosable: false,
      nzTitle: title ?? '',
      nzData: dialogData,
      ...option,
    });
  }

  closeModal() {
    this.modal.closeAll();
  }
}
