export class userRequestBody {
    name: string = "";
    email: string = "";
    password: string = "";
}

export class authenicationStatus{
    isAuthenticated:boolean =false;
    hasAuthenticationCheck:boolean = false;

}

export class userExistResponse {
    authtoken: string = "";
    userExist: boolean = false;
    userData: UserData = new UserData();
}

export class UserData {
    _id: string = "";
    name: string = "";
    email: string = "";
    password: string = "";
    avatar: string = "";
    date: string = "";
    __v: string = "";
}
