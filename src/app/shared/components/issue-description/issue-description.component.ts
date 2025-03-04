import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../query/project.service';
import { ButtonComponent } from '../button/button.component';
import { QuillModule } from 'ngx-quill';


export const quillConfiguration = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    ['link'],
    ['clean']
  ]
};
@Component({
  selector: 'issue-description',
  templateUrl: './issue-description.component.html',
  styleUrls: ['./issue-description.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    ButtonComponent,
    QuillModule,
    ReactiveFormsModule
  ]
})
export class IssueDescriptionComponent implements OnChanges {
  @Input() issue!: any;
  descriptionControl!: FormControl;
  editorOptions = quillConfiguration;
  isEditing!: boolean;
  isWorking!: boolean;

  constructor(private _projectService: ProjectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const issueChange = changes['issue'];
    if (issueChange.currentValue !== issueChange.previousValue) {
      this.descriptionControl = new FormControl(this.issue.description);
    }
  }

  setEditMode(mode: boolean) {
    this.isEditing = mode;
  }

  editorCreated(editor: any) {
    if (editor && editor.focus) {
      editor.focus();
    }
  }

  save() {
    this._projectService.updateIssue({
      ...this.issue,
      description: this.descriptionControl.value
    });
    this.setEditMode(false);
  }

  cancel() {
    this.descriptionControl.patchValue(this.issue.description);
    this.setEditMode(false);
  }
}
