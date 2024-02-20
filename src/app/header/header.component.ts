import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private _authListenerSubs: Subscription;
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      this._authListenerSubs = this.authService.authStatusEmitter.subscribe({
        next: isUserAuthenticated => {
          this.isAuthenticated = isUserAuthenticated;
        }
      });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
      this._authListenerSubs?.unsubscribe();
  }
}
