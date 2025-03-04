import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { JUser } from '../enum/user';
import { AuthStore } from '../store/auth.store';

export interface AuthState extends JUser {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
  user$ = this.select();
  userId$ = this.select('id');

  constructor(protected override store: AuthStore) {
    super(store);
  }
}
