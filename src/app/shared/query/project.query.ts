import { Injectable } from '@angular/core';
import { map, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IssueStatus, JIssue } from '../enum/issue.enum';
import { Query } from '@datorama/akita';
import { ProjectState, ProjectStore } from '../store/project/project.store';


@Injectable({
  providedIn: 'root'
})
export class ProjectQuery extends Query<ProjectState> {
  isLoading$ = this.selectLoading();
  all$ = this.select();
  issues$ = this.select('issues');
  users$ = this.select('users');

  constructor(public override store: ProjectStore) {
    super(store);
  }

  lastIssuePosition = (status: IssueStatus): number => {
    const raw = this.store.getValue();
    const issuesByStatus = raw.issues.filter((x: any) => x.status === status);
    return issuesByStatus.length;
  };

  issueByStatusSorted$ = (status: IssueStatus): Observable<JIssue[]> => this.issues$.pipe(
      map((issues) => issues
          .filter((x: any) => x.status === status)
          .sort((a: any, b: any) => a.listPosition - b.listPosition))
    );

  issueById$(issueId: string){
    return this.issues$.pipe(
      delay(500),
      map((issues) => issues.find((x: any) => x.id === issueId))
    );
  }
}
