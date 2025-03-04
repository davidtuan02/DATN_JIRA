import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzModalService } from 'ng-zorro-antd/modal';
import { JIssue } from '../../enum/issue.enum';
import { JUser } from '../../enum/user';
import { IssuePriorityIcon } from '../../interface/issue-priority-icon';
import { ProjectQuery } from '../../query/project.query';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../avatar/avatar.component';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { IssueUtil } from '../../utils/issue';
import { IssueModalComponent } from '../issue-modal/issue-modal.component';

@Component({
  selector: 'issue-card',
  templateUrl: './issue-card.component.html',
  styleUrls: ['./issue-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    SvgIconComponent
  ]
})
@UntilDestroy()
export class IssueCardComponent implements OnChanges, OnInit {
  @Input() issue!: JIssue;
  assignees!: any[];
  issueTypeIcon!: string;
  priorityIcon!: IssuePriorityIcon;

  constructor(private _projectQuery: ProjectQuery, private _modalService: NzModalService) {}

  ngOnInit(): void {
    this._projectQuery.users$.pipe(untilDestroyed(this)).subscribe((users) => {
      this.assignees = this.issue.userIds.map((userId) => users.find((x) => x.id === userId));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const issueChange = changes['issue'];
    if (issueChange?.currentValue !== issueChange.previousValue) {
      this.issueTypeIcon = IssueUtil.getIssueTypeIcon(this.issue.type);
      this.priorityIcon = IssueUtil.getIssuePriorityIcon(this.issue.priority);
    }
  }

  openIssueModal(issueId: string) {
    this._modalService.create({
      nzContent: IssueModalComponent,
      nzWidth: 1040,
      nzClosable: false,
      nzFooter: null,
      nzData: {
        issue$: this._projectQuery.issueById$(issueId)
      }
    });
  }
}
