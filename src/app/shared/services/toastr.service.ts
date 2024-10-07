import { Injectable } from "@angular/core";
import { NzNotificationService } from "ng-zorro-antd/notification";

@Injectable({
    providedIn: 'root'
})
export class ToastrService {
    constructor(private notification: NzNotificationService) {}
    public success(content: string) {
        return this.notification.create(
            'success',
            content,
            '',
            {
                nzStyle: {
                    backgroundColor: '#D9FFD7',
                    border: '1px solid #73D36B'
                }
            }
        );
    }

    public error(content: string) {
        return this.notification.create(
            'error',
            content,
            '',
            {
                nzStyle: {
                    backgroundColor: '#FFE2E3',
                    border: '1px solid #FD7D7F'
                }
            }
        );
    }
}