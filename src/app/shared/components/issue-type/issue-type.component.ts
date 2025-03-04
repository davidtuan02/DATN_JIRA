import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IssueUtil } from '../../utils/issue';
import { IssueTypeWithIcon } from '../../interface/issue-type-icon';
import { ProjectService } from '../../query/project.service';
import { IssuePriority, IssueType } from '../../enum/issue.enum';
import { IssuePriorityIcon } from '../../interface/issue-priority-icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';


export class ProjectConst {
  static readonly IssueId = 'issueId';
  static readonly Projects = 'Projects';
  static PrioritiesWithIcon: IssuePriorityIcon[] = [
    IssueUtil.getIssuePriorityIcon(IssuePriority.LOWEST),
    IssueUtil.getIssuePriorityIcon(IssuePriority.LOW),
    IssueUtil.getIssuePriorityIcon(IssuePriority.MEDIUM),
    IssueUtil.getIssuePriorityIcon(IssuePriority.HIGH),
    IssueUtil.getIssuePriorityIcon(IssuePriority.HIGHEST)
  ];

  static IssueTypesWithIcon: IssueTypeWithIcon[] = [
    new IssueTypeWithIcon(IssueType.BUG),
    new IssueTypeWithIcon(IssueType.STORY),
    new IssueTypeWithIcon(IssueType.TASK)
  ];
}

@Component({
  selector: 'issue-type',
  templateUrl: './issue-type.component.html',
  styleUrls: ['./issue-type.component.scss'],
  standalone: true,
  imports: [
    NzDropDownModule,
    SvgIconComponent
  ]
})
export class IssueTypeComponent implements OnInit, OnChanges {
  @Input() issue!: any;

  get selectedIssueTypeIcon(): string {
    return IssueUtil.getIssueTypeIcon(this.issue.type);
  }

  issueTypes: IssueTypeWithIcon[];

  constructor(private _projectService: ProjectService) {
    this.issueTypes = ProjectConst.IssueTypesWithIcon;
  }

  ngOnInit() {}

  ngOnChanges(): void {}

  updateIssue(issueType: IssueType) {
    this._projectService.updateIssue({
      ...this.issue,
      type: issueType
    });
  }

  isTypeSelected(type: IssueType) {
    return this.issue.type === type;
  }
}
