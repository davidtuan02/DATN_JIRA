import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IssueStatus } from '../../../shared/enum/issue.enum';
import { BoardDndListComponent } from '../board-dnd-list/board-dnd-list.component';
import { ProjectQuery } from '../../../shared/query/project.query';
import { AuthQuery } from '../../../shared/query/auth.query';
import { CommonModule } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'board-dnd',
  templateUrl: './board-dnd.component.html',
  styleUrls: ['./board-dnd.component.scss'],
  standalone: true,
  imports: [
    BoardDndListComponent,
    CommonModule
  ]
})
export class BoardDndComponent {
  issueStatuses: IssueStatus[] = [
    IssueStatus.BACKLOG,
    IssueStatus.SELECTED,
    IssueStatus.IN_PROGRESS,
    IssueStatus.DONE
  ];

  constructor(public projectQuery: ProjectQuery, public authQuery: AuthQuery) {}
  // constructor() {}
}
