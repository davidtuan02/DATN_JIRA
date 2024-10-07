import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(
    private notification: NzNotificationService,
    private injector: Injector
  ) {}

  success(content: string) {
    const translate = this.injector.get(TranslateService);
    return this.notification.success('', translate.instant(content), {
      nzStyle: {
        backgroundColor: '#d9ffd7',
        border: '1px solid #73d36b',
      },
    });
  }

  error(content: string) {
    const translate = this.injector.get(TranslateService);
    return this.notification.error('', translate.instant(content), {
      nzStyle: {
        backgroundColor: '#ffe2e3',
        border: '1px solid #fd7d7f',
      },
    });
  }
}
