import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

export interface IBreadcrumb {
  label: string;
  path?: string;
}
@Injectable({
  providedIn: 'root',
})
export class BreadcrumService {
  breadcrumb = new BehaviorSubject<IBreadcrumb[]>([]);
  breadcrumb$ = this.breadcrumb.asObservable();
  constructor() {}

  get getBreadcrumb() {
    return this.breadcrumb$;
  }
}
