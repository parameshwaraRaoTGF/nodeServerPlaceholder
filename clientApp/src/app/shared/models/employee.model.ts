export class createEmployeeReqbody {
  Employee_ID: string = "";
  Full_Name: string = "";
  Job_Title: string = "";
  Department: string = "";
  Business_Unit: string = "";
  Gender: string = "";
  Ethnicity: string = "";
  Age: string = "";
  Hire_Date: string = "";
  Annual_Salary: string = "";
  Bonus: string = "";
  Country: string = "";
  City: string = "";
}

export class updateEmployeeReqBody extends createEmployeeReqbody {
  constructor() {
    super();
  }
  _id: string = "";
}

export class empoloyeeListReq {
  Employee_ID: string = "";
  Full_Name: string = "";
  Job_Title: string = "";
  Department: string = "";
  Business_Unit: string = "";
  Gender: string = "";
  Ethnicity: string = "";
  Country: string = "";
  City: string = "";
  pageIndex: number = 0;
  recordPerPage: number = 15;

}


export class employeeResponse {
  empdata: employeeObject[] = [];
  totalCount: TotalCount[] = [];
}

export class employeeObject {
  _id: string = "";
  Employee_ID: string = "";
  Full_Name: string = "";
  Job_Title: string = "";
  Department: string = ""
  Business_Unit: string = "";
  Gender: string = "";
  Ethnicity: string = "";
  Age: string = "";
  Hire_Date: string = "";
  Annual_Salary: string = "";
  Bonus: string = "";
  Country: string = "";
  City: string = "";
}
export class detailResponse extends employeeObject {
  constructor() {
    super();
  }
}

export class TotalCount {
  _id: any;
  count: number = 0;
}



export class updateEmployeeReqbody extends createEmployeeReqbody {
  public _id: string = "";
  constructor() {
    super();
  }
}