module.exports = class UserDto {
    email;
    id;
    role;
    isActivated;
    nickName;
    firstName;
    lastName;
    userResults;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.role = model.role;
        this.isActivated = model.isActivated;
        this.nickName = model.nickName;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.userResults = model.results
    }
}