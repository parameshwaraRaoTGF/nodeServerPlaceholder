import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';




import { zippedFileService } from './shared/service/zippedFile.service';
import { LoadingInterceptor } from './shared/service/loading-interceptor.service';




@NgModule({
  declarations: [
    AppComponent
        
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
              
  ],
  providers: [zippedFileService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
   }
   ],
  bootstrap: [AppComponent]
})
export class AppModule { }
