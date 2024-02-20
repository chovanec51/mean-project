import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, catchError, throwError } from "rxjs";
import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private dialog: MatDialog){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                let errMessage = "An unknown error occured."
                let errReason = "An unkown reason."
                if (err?.error?.message) {
                    errMessage = err.error.message;
                }
                if (err?.error?.reason) {
                    errReason = err.error.reason;
                }
                this.dialog.open(ErrorComponent, {
                    data: {message: errMessage, reason: errReason} 
                });
                return throwError(() => {err});
            })
        );
    }
}