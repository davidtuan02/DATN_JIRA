import { Component, EventEmitter } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { DeleteIssueModel } from '../issue-detail/issue-detail.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'issue-delete-modal',
  templateUrl: './issue-delete-modal.component.html',
  styleUrls: ['./issue-delete-modal.component.scss'],
  standalone: true,
  imports: [
    ButtonComponent
  ]
})
export class IssueDeleteModalComponent {
  issueId!: string;

  onDelete = new EventEmitter<DeleteIssueModel>();

  constructor(private _modalRef: NzModalRef) {}

  deleteIssue() {
    this.onDelete.emit(new DeleteIssueModel(this.issueId, this._modalRef));
  }

  closeModal() {
    this._modalRef.close();
  }
}
