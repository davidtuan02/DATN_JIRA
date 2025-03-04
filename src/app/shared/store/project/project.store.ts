import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { JProject } from '../../enum/project';

export type ProjectState = JProject;

function createInitialState(): ProjectState {
  return {
    issues: [],
    users: []
  } as unknown as ProjectState;
}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({
  name: 'project'
})
export class ProjectStore extends Store<ProjectState> {
  constructor() {
    super(createInitialState());
  }
}
