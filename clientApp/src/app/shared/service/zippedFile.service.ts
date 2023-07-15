import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, throwError, forkJoin, BehaviorSubject, ReplaySubject } from 'rxjs';
import { userRequestBody, authenicationStatus } from '../models/user.model';
import { createEmployeeReqbody, empoloyeeListReq, updateEmployeeReqBody } from '../models/employee.model';



@Injectable({
  providedIn: 'root'
})
export class zippedFileService {

  //flag to check if user authenticated
  public isUserAuthenticated: boolean = false;
  public userName: string = "";
  baseURL: string = `${environment.backendOrigin}/`;
  authToken: string = "";
  loginURL: string = "api/auth";
  signUpURL: string = "api/users";
  userExistURL: string = "api/auth/userExist";
  updatePasswordURL: string = "api/auth/updatePassword";
  
  

  employeeListURL: string = "api/employee/List";
  createEmployeeURL: string = "api/employee/CreateEmployee";
  employeeDetailURL: string = "api/employee/employeeDetail";
  updateEmployeeURL: string = "api/employee/updateEmployee";
  removeEmployeeURL: string = "api/employee/RemoveEmployee";

  getAllDepartmentOptionURL: string = "api/employee/DepartmentOptions";
  getAllBussinessOptionURL: string = "api/employee/BussinessUnitOptions";
  getAllCountryOptionURL: string = "api/employee/CountryOptions";
  getallCityOptionsURL: string = "api/employee/CityOptions";
  getallGenderOptionsURL: string = "api/employee/GenderOptions";
  getallEthnicityOptionsURL: string = "api/employee/EthnicityOptions";

 

  
 




  constructor(private _httpClient: HttpClient) {
   
     

   

  }



  

  getHttpUrl(urlSegment: string): string {
    return `${this.baseURL}${urlSegment}`;
  }

  //error handler
  public errorHandler(errorResponse: HttpErrorResponse) {
    return throwError(() => errorResponse);
  }

  public userLogin(userName: string = "", userPassword: string = ""): Observable<any> {
    let url: string = this.getHttpUrl(this.loginURL);
    return this._httpClient.post(url, {
      email: userName,
      password: userPassword
    }).pipe(catchError(this.errorHandler));
  }

  public signUpUsers(userDetails: userRequestBody): Observable<any> {
    let url: string = this.getHttpUrl(this.signUpURL);
    return this._httpClient.post(url, userDetails).pipe(catchError(this.errorHandler));
  }

  public validateUser(useEmail: string = "", appSecertKey: string = ""): Observable<any> {
    let url: string = this.getHttpUrl(this.userExistURL);
    return this._httpClient.post(url, {
      email: useEmail,
      secertKey: appSecertKey
    }).pipe(catchError(this.errorHandler));
  }

  public changeUserPassword(userReferenceID: string = "", updatedPassword: string = ""): Observable<any> {
    let url: string = this.getHttpUrl(this.updatePasswordURL);
    return this._httpClient.post(url, {
      _id: userReferenceID,
      updatedPassword: updatedPassword
    }).pipe(catchError(this.errorHandler));
  }

  //employee
  public getEmployeeList(employeeListReq: empoloyeeListReq): Observable<any> {
    let url: string = this.getHttpUrl(this.employeeListURL);
    return this._httpClient.post(url, employeeListReq).pipe(catchError(this.errorHandler));
  }

  public getEmployeeDetail(userReferenceID: string = ""): Observable<any> {
    let url: string = this.getHttpUrl(this.employeeDetailURL);
    url = `${url}/${userReferenceID}`;
    return this._httpClient.get(url).pipe(catchError(this.errorHandler));
  }

  public createEmployee(newEmployeeReq: createEmployeeReqbody): Observable<any> {
    let url: string = this.getHttpUrl(this.createEmployeeURL);
    return this._httpClient.post(url, newEmployeeReq).pipe(catchError(this.errorHandler));
  }

  public updateEmployee(updateEmployeeReq: updateEmployeeReqBody): Observable<any> {
    let url: string = this.getHttpUrl(this.updateEmployeeURL);
    return this._httpClient.put(url, updateEmployeeReq).pipe(catchError(this.errorHandler));
  }

  public deleteEmployee(employeeObjectid: string = ""): Observable<any> {
    let url: string = this.getHttpUrl(this.removeEmployeeURL);
    url = `${url}/${employeeObjectid}`;
    return this._httpClient.delete(url).pipe(catchError(this.errorHandler));
  }


  //forkjoin concept

  public getAllSearchOptions(): Observable<any> {



    let AllrequestObservables = [];

    //department options
    let departmentUrl: string = this.getHttpUrl(this.getAllDepartmentOptionURL);
    AllrequestObservables.push(this._httpClient.get(departmentUrl).pipe(catchError(this.errorHandler)));

    //bussiness options
    let bussinessOptionUrl: string = this.getHttpUrl(this.getAllBussinessOptionURL);
    AllrequestObservables.push(this._httpClient.get(bussinessOptionUrl).pipe(catchError(this.errorHandler)));

    //country options
    let countryOptionUrl: string = this.getHttpUrl(this.getAllCountryOptionURL);
    AllrequestObservables.push(this._httpClient.get(countryOptionUrl).pipe(catchError(this.errorHandler)));

    //city options
    let cityOptionUrl: string = this.getHttpUrl(this.getallCityOptionsURL);
    AllrequestObservables.push(this._httpClient.get(cityOptionUrl).pipe(catchError(this.errorHandler)));

    //gender options
    let genderOptionUrl: string = this.getHttpUrl(this.getallGenderOptionsURL);
    AllrequestObservables.push(this._httpClient.get(genderOptionUrl).pipe(catchError(this.errorHandler)));

    //ethnicity options
    let ethnicityOptionUrl: string = this.getHttpUrl(this.getallEthnicityOptionsURL);
    AllrequestObservables.push(this._httpClient.get(ethnicityOptionUrl).pipe(catchError(this.errorHandler)));


    return forkJoin(AllrequestObservables);

  }

  

}
