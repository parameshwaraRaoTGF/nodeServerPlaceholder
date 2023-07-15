import { Injectable } from '@angular/core';
import { LoadingServiceService } from './loading-service.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptor implements HttpInterceptor {

  /**
   * 
   * use RXJS tap to keep track of each request emission
   * 
   * update, used rxjs finalize that mirrors all emission and gives signal when all observables are 
   * complete
   */

  constructor(private _LoadingServiceService: LoadingServiceService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.showSpinner();



    return next.handle(req).pipe(
      finalize(
        () => {
          this.hideSpinner();
        }
      )
    );

    /*return next.handle(req).pipe(
      tap(
        {
          next:async (event: HttpEvent <any>)=>{
            if (event instanceof HttpResponse) {
              this.hideSpinner();
          }

          },
          complete: () =>{
            this.hideSpinner();
          },
          error: (err:any) =>{
            this.hideSpinner();
          }
          
        }

      )
    );*/


  }

  public showSpinner() {
    this._LoadingServiceService.loadingStatus.next(true);
  }
  public hideSpinner() {
    this._LoadingServiceService.loadingStatus.next(false);
  }
}
