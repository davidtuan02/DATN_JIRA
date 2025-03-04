import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { JIssue } from '../../enum/issue.enum';
import { ProjectQuery } from '../../query/project.query';
import { ButtonComponent } from '../button/button.component';
import { IssueDeleteModalComponent } from '../issue-delete-modal/issue-delete-modal.component';
import { IssueTypeComponent } from '../issue-type/issue-type.component';
import { IssueTitleComponent } from '../issue-title/issue-title.component';
import { IssueDescriptionComponent } from '../issue-description/issue-description.component';
import { IssueCommentsComponent } from '../issue-comments/issue-comments.component';


export class DeleteIssueModel {
  constructor(public issueId: string, public deleteModalRef: NzModalRef) {}
}

@Component({
  selector: 'issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss'],
  standalone: true,
  imports: [
    ButtonComponent,
    IssueTypeComponent,
    IssueTitleComponent,
    IssueDescriptionComponent,
    IssueCommentsComponent
  ]
})
export class IssueDetailComponent{
  @Input() issue!: any;
  @Input() isShowFullScreenButton!: boolean;
  @Input() isShowCloseButton!: boolean;
  @Output() onClosed = new EventEmitter();
  @Output() onOpenIssue = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<DeleteIssueModel>();

  constructor(public projectQuery: ProjectQuery, private _modalService: NzModalService) {}

  openDeleteIssueModal() {
    this._modalService.create({
      nzContent: IssueDeleteModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzStyle: {
        top: '140px'
      },
      nzData: {
        issueId: this.issue.id,
        onDelete: this.onDelete
      }
    });
  }

  closeModal() {
    this.onClosed.emit();
  }

  openIssuePage() {
    this.onOpenIssue.emit(this.issue.id);
  }
}
