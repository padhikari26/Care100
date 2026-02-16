class LoginResponseModel {
  int? status;
  String? message;
  String? token;
  UserData? user;

  LoginResponseModel({this.status, this.message, this.token, this.user});

  LoginResponseModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    token = json['token'];
    user = json['user'] != null ? UserData.fromJson(json['user']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    data['token'] = token;
    if (user != null) {
      data['user'] = user!.toJson();
    }
    return data;
  }
}

class UserData {
  String? id;
  String? email;
  String? userType;
  String? name;
  String? role;
  String? orgId;
  String? gender;
  String? orgLogo;
  dynamic signature;
  String? reportingTo;
  String? contactNumber;
  String? address;
  String? birthDay;
  String? createdAt;
  String? updatedAt;

  UserData({
    this.id,
    this.email,
    this.userType,
    this.name,
    this.role,
    this.orgId,
    this.orgLogo,
    this.gender,
    this.signature,
    this.reportingTo,
    this.contactNumber,
    this.address,
    this.birthDay,
    this.createdAt,
    this.updatedAt,
  });

  UserData.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    email = json['email'];
    userType = json['userType'];
    name = json['name'];
    role = json['role'];
    orgId = json['orgId'];
    gender = json['gender'];
    orgLogo = json['orgLogo'];
    signature = json['signature'];
    reportingTo = json['reportingTo'];
    contactNumber = json['contactNumber'];
    address = json['address'];
    birthDay = json['dob'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['email'] = email;
    data['userType'] = userType;
    data['name'] = name;
    data['role'] = role;
    data['orgId'] = orgId;
    data['gender'] = gender;
    data['orgLogo'] = orgLogo;
    data['signature'] = signature;
    data['reportingTo'] = reportingTo;
    data['contactNumber'] = contactNumber;
    data['address'] = address;
    data['dob'] = birthDay;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    return data;
  }

  //copyWith method
  UserData copyWith({
    String? id,
    String? email,
    String? userType,
    String? name,
    String? role,
    String? orgId,
    String? orgLogo,
    String? gender,
    dynamic signature,
    String? reportingTo,
    String? contactNumber,
    String? address,
    String? birthDay,
    String? createdAt,
    String? updatedAt,
  }) {
    return UserData(
      id: id ?? this.id,
      email: email ?? this.email,
      userType: userType ?? this.userType,
      name: name ?? this.name,
      role: role ?? this.role,
      orgId: orgId ?? this.orgId,
      orgLogo: orgLogo ?? this.orgLogo,
      gender: gender ?? this.gender,
      signature: signature ?? this.signature,
      reportingTo: reportingTo ?? this.reportingTo,
      contactNumber: contactNumber ?? this.contactNumber,
      address: address ?? this.address,
      birthDay: birthDay ?? this.birthDay,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
