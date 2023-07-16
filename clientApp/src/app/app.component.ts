import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingServiceService } from './shared/service/loading-service.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { zippedFileService } from './shared/service/zippedFile.service';

export interface zippedFileList {
  bucket: string;
  path_: string;
}

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
  public userPathName: string = "";
  public listFiles: Array<string> = [];


  constructor(
    private _LoadingServiceService: LoadingServiceService,
    private cdRef: ChangeDetectorRef,
    private _FormBuilder: FormBuilder,
    private _zippedFileService: zippedFileService
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
      userPath: ['', [Validators.required, Validators.minLength(5)]],
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

  public validateName() {

    this.userZipDetailsForm.markAllAsTouched();

    let { userPath } = this.userZipDetailsForm.value;

    if (userPath && this.userZipDetailsForm.valid) {
      //assign the value
      this.userPathName = <string>userPath;
      this.getFileListFromGCP();
    }

  }

  //to get files list

  public getFileListFromGCP() {

    this.listFiles = [];
    if (this.userPathName) {
      this._zippedFileService.listAllFiles(this.userPathName).subscribe({
        next: (data) => {

          if (data.files) {
            let filesArrayObject = <Array<zippedFileList>>data.files;
            if (filesArrayObject.length > 0) {
              this.listFiles = filesArrayObject.map((fileobject) => {
                let fileName = <string>fileobject.path_.split("/").pop();
                return fileName;
              });
            }
          }
        },
        error: (err) => {
          this.listFiles = [];
        }
      });

    }



  }

  //delete a single file Handler

  public deleteAFile(fileName: string) {

    if (fileName && this.userPathName) {

      let deleteFileRef = [fileName];

      this._zippedFileService.deleteFiles(this.userPathName, deleteFileRef).subscribe({
        next: (data) => {

          this.getFileListFromGCP();
        },
        error: (err) => {
          //get updated list from firebase storage
          this.getFileListFromGCP();
        }
      });


    }





  }

  //deletes all files
  public deleteAllFiles() {
    if (this.listFiles.length > 0 && this.userPathName) {
      this._zippedFileService.deleteFiles(this.userPathName, this.listFiles).subscribe({
        next: (data) => {
          this.getFileListFromGCP();
        },
        error: (err) => {
          //get updated list from firebase storage
          this.getFileListFromGCP();
        }
      });

    }

  }


  //compress file Handler

  public compressFiles() {
    let { compressedFilename } = this.userZipDetailsForm.value;

    if (this.listFiles.length > 0
      &&
      this.userPathName
      &&
      compressedFilename) {


      this._zippedFileService.downloadFilesAsCompressed(this.userPathName, compressedFilename).subscribe({
        next: (data) => {
          let blob = new Blob([data.body], { type: 'application/zip' });

          var downloadURL = window.URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.setAttribute('style', 'display:none;');
          document.body.appendChild(link);
          link.href = downloadURL;
          link.download = `${compressedFilename}.zip`;
          link.target = '_blank';
          link.click();
          document.body.removeChild(link);

         

          //clear all old files
          this.deleteAllFiles();
        },
        error: (err) => {
          //get updated list from firebase storage
          this.getFileListFromGCP();
        }
      });

    }

  }

  //file upload

  public onFileSubmit($event: any) {
    let { target: { files } } = $event;
    let valid_files: Array<File> = files;
    this.sendFilesToGCPStorage(valid_files);
  }

  public onFileDragAndDrop(filesList: Array<File>) {
    this.sendFilesToGCPStorage(filesList);
  }

  public sendFilesToGCPStorage(files: Array<File>) {
    if (this.userPathName) {

      this._zippedFileService.uploadFiles(this.userPathName, files).subscribe({
        next: (data) => {
          

          //get updated list from firebase storage
          this.getFileListFromGCP();
        },
        error: (err) => {
          //get updated list from firebase storage
          this.getFileListFromGCP();
        }
      });
    }

    else {
      this.userZipDetailsForm.markAllAsTouched();
    }

  }




  title = "rao's node js file zipper";


}
