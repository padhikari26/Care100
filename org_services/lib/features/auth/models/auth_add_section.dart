class AuthAddSectionList {
  int? status;
  String? message;
  List<Orgs>? orgs;

  AuthAddSectionList({this.status, this.message, this.orgs});

  AuthAddSectionList.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    if (json['orgs'] != null) {
      orgs = <Orgs>[];
      json['orgs'].forEach((v) {
        orgs!.add(Orgs.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    if (orgs != null) {
      data['orgs'] = orgs!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Orgs {
  String? id;
  String? orgName;

  Orgs({this.id, this.orgName});

  Orgs.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    orgName = json['orgName'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['orgName'] = orgName;
    return data;
  }
}
