import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingServiceService } from './shared/service/loading-service.service';
import { Subscription } from 'rxjs';
import { FormBuilder , FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  sub: Subscription = new Subscription();

  userZipDetailsForm: FormGroup = new FormGroup({});
  
  showGridSpinner: boolean = false;

  //holds the sub folder to be created in GCP storage for reference
  public userPathName:string ="";
  public listFiles:Array<any> = [];


  constructor(
    private _LoadingServiceService: LoadingServiceService,   
    private cdRef: ChangeDetectorRef,
    private _FormBuilder: FormBuilder
  ) {

  }
  ngAfterViewInit(): void {
    this.sub = this._LoadingServiceService.loadingStatus.subscribe((loadingStat) => {
      this.showGridSpinner = loadingStat;
      this.cdRef.detectChanges();
    });

    
  }
  ngOnDestroy(): void {
    //close subscription
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  ngOnInit(): void {

    this.userZipDetailsForm = this._FormBuilder.group({
      userPath: ['', Validators.required],
      compressedFilename: ['raosFileCompressed', Validators.required]
    });

  }

  public inputboxValidation(formControlName: string): boolean {
    if (
      (this.userZipDetailsForm.get(formControlName)?.dirty || this.userZipDetailsForm.get(formControlName)?.touched) &&
      this.userZipDetailsForm.get(formControlName)?.errors
    ) {
      return true;

    } else {
      return false;
    }
  }

  public validateName(){

  }

 


  title = "rao's node js file zipper";
 
  
}
