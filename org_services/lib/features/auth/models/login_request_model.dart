class LoginRequestModel {
  String? code;

  LoginRequestModel({this.code});

  Map<String, dynamic> toJson() {
    return {'code': code};
  }

  factory LoginRequestModel.fromJson(Map<String, dynamic> json) {
    return LoginRequestModel(code: json['code'] as String?);
  }
}
