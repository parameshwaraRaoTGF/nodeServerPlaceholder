import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, throwError, forkJoin, BehaviorSubject, ReplaySubject } from 'rxjs';
import { userRequestBody, authenicationStatus } from '../models/user.model';
import { createEmployeeReqbody, empoloyeeListReq, updateEmployeeReqBody } from '../models/employee.model';



@Injectable({
  providedIn: 'root'
})
export class zippedFileService {

  baseURL: string = `${environment.backendOrigin}/`;
  //fileupload URL's
  fileUploadURL: string = "uploadFile";
  compressedFileURL: string = "compressedFileListDownload";
  listAllFilesURL: string = "fileList";
  deleteAllFiles: string = "deleteFile";

  constructor(private _httpClient: HttpClient) { }

  getHttpUrl(urlSegment: string): string {
    return `${this.baseURL}${urlSegment}`;
  }

  //error handler
  public errorHandler(errorResponse: HttpErrorResponse) {
    return throwError(() => errorResponse);
  }

  /**
   * This lists all Files present in firebase storage
   * @param userName :- this is sub folder directory in GCP firebase storage
   * @returns 
   */

  public listAllFiles(userName: string): Observable<any> {
    let url: string = this.getHttpUrl(this.listAllFilesURL);
    return this._httpClient.post(url, {
      userPath: userName
    }).pipe(catchError(this.errorHandler));
  }

  /**
   * This delete Files present in firebase storage. Pass all file names accordingly
   * @param userName :- this is sub folder directory in GCP firebase storage
   * @param filesList :- this contains names of files to delete
   * @returns 
   */

  public deleteFiles(userName: string, filesList: Array<string>): Observable<any> {
    let url: string = this.getHttpUrl(this.deleteAllFiles);

    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
      userPath: userName,
      filesToDelete: filesList
      },
    };


    return this._httpClient.delete(url,options).pipe(catchError(this.errorHandler));
  }

  /**
   * This upload files to GCP storage. we are using rxjs forkjoin to make multiple calls and upload files
   * simultaneously
   * @param userName :- this is sub folder directory in GCP firebase storage
   * @returns 
   */

  public uploadFiles(userName: string, filesToUpload: Array<File>): Observable<any> {
    let url: string = this.getHttpUrl(this.fileUploadURL);

    let AllrequestObservables = [];

    for (let file of filesToUpload) {
      // Create form data
      const formData = new FormData();

      // Store form name as "file" with file data
      formData.append("samplefile", file, file.name);

      //set headers for reference
      let headersToSend = new HttpHeaders({userPath:userName});


      //push the observables in master list    
      AllrequestObservables.push(this._httpClient.post(url, formData,{
        headers:headersToSend,
        reportProgress: true,
        observe: 'events'}).pipe(catchError(this.errorHandler)));
    }

    return forkJoin(AllrequestObservables);
  }


/**
   * This delete Files present in firebase storage. Pass all file names accordingly
   * @param userName :- this is sub folder directory in GCP firebase storage
   * @param filesList :- this contains names of files to delete
   * @returns 
   */

public downloadFilesAsCompressed(userName: string, outputFileName: string): Observable<any> {
  let url: string = this.getHttpUrl(this.compressedFileURL);
  return this._httpClient.post(url, {
    userPath: userName,
    compressedFilename: outputFileName
  },{ reportProgress: true, observe: 'response' , responseType: 'blob'}).pipe(catchError(this.errorHandler));
}


}
