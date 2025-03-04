import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { JIssue } from '../../enum/issue.enum';
import { ProjectService } from '../../query/project.service';
import { IssueDetailComponent } from '../issue-detail/issue-detail.component';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'issue-modal',
  templateUrl: './issue-modal.component.html',
  styleUrls: ['./issue-modal.component.scss'],
  standalone: true,
  imports: [
    IssueDetailComponent,
    CommonModule
  ]
})
export class IssueModalComponent {
  @Input() issue$!: Observable<JIssue>;

  constructor(
    private _modal: NzModalRef,
    private _router: Router,
    private _projectService: ProjectService
  ) {}

  closeModal() {
    this._modal.close();
  }

  openIssuePage(issueId: string) {
    this.closeModal();
    this._router.navigate(['project', 'issue', issueId]);
  }

  deleteIssue({ issueId, deleteModalRef }: any) {
    this._projectService.deleteIssue(issueId);
    deleteModalRef.close();
    this.closeModal();
  }
}
