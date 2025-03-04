import { Component, Input, OnInit } from '@angular/core';
import { IssueStatus, IssueStatusDisplay } from '../../enum/issue.enum';
import { ProjectService } from '../../query/project.service';
import { ProjectQuery } from '../../query/project.query';
import { ButtonComponent } from '../button/button.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'issue-status',
  templateUrl: './issue-status.component.html',
  styleUrls: ['./issue-status.component.scss'],
  standalone: true,
  imports: [
    ButtonComponent,
    NzDropDownModule,
    CommonModule
  ]
})
export class IssueStatusComponent implements OnInit {
  @Input() issue: any;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  IssueStatusDisplay = IssueStatusDisplay;

  variants: any = {
    [IssueStatus.BACKLOG]: 'btn-secondary',
    [IssueStatus.SELECTED]: 'btn-secondary',
    [IssueStatus.IN_PROGRESS]: 'btn-primary',
    [IssueStatus.DONE]: 'btn-success'
  };

  issueStatuses!: IssueStatusValueTitle[];

  constructor(private _projectService: ProjectService, private _projectQuery: ProjectQuery) {}

  ngOnInit(): void {
    this.issueStatuses = [
      new IssueStatusValueTitle(IssueStatus.BACKLOG),
      new IssueStatusValueTitle(IssueStatus.SELECTED),
      new IssueStatusValueTitle(IssueStatus.IN_PROGRESS),
      new IssueStatusValueTitle(IssueStatus.DONE)
    ];
  }

  updateIssue(status: IssueStatus) {
    const newPosition = this._projectQuery.lastIssuePosition(status);
    this._projectService.updateIssue({
      ...this.issue,
      status,
      listPosition: newPosition + 1
    });
  }

  isStatusSelected(status: IssueStatus) {
    return this.issue.status === status;
  }
}

class IssueStatusValueTitle {
  value: IssueStatus;
  label: string;
  constructor(issueStatus: IssueStatus) {
    this.value = issueStatus;
    this.label = IssueStatusDisplay[issueStatus];
  }
}
