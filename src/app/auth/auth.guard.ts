import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, of, take } from "rxjs";
import { AuthService } from "./auth.service";

export const AuthGuardFn: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    return authService.authStatusEmitter
        .pipe(
            take(1),
            map(isUserAuthenticated => {
                if (!isUserAuthenticated) {
                    return router.createUrlTree(['/login']);
                }
                return isUserAuthenticated;
            })
        )
}