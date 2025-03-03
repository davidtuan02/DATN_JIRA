import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IssueStatus } from '../../../shared/enum/issue.enum';
import { BoardDndListComponent } from '../board-dnd-list/board-dnd-list.component';

@UntilDestroy()
@Component({
  selector: 'board-dnd',
  templateUrl: './board-dnd.component.html',
  styleUrls: ['./board-dnd.component.scss'],
  standalone: true,
  imports: [
    BoardDndListComponent
  ]
})
export class BoardDndComponent {
  issueStatuses: IssueStatus[] = [
    IssueStatus.BACKLOG,
    IssueStatus.SELECTED,
    IssueStatus.IN_PROGRESS,
    IssueStatus.DONE
  ];

  // constructor(public projectQuery: ProjectQuery, public authQuery: AuthQuery) {}
  constructor() {}
}
