import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../query/project.service';

@Component({
  selector: 'issue-title',
  templateUrl: './issue-title.component.html',
  styleUrls: ['./issue-title.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class IssueTitleComponent implements OnChanges {
  @Input() issue: any;
  titleControl!: FormControl;

  constructor(private _projectService: ProjectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const issueChange = changes['issue'];
    if (issueChange.currentValue !== issueChange.previousValue) {
      this.titleControl = new FormControl(this.issue.title);
    }
  }

  onBlur() {
    this._projectService.updateIssue({
      ...this.issue,
      title: this.titleControl.value
    });
  }
}
