class Validator {
  static String? validateMobile(String? value) {
    if (value == null || value.isEmpty) {
      return "Mobile is Required";
    }
    const pattern = r'(?:\+977[- ])?\d{2}-?\d{7,8}';
    final regExp = RegExp(pattern);
    if (value.length != 10) {
      return "Mobile number must be of 10 digits";
    } else if (!regExp.hasMatch(value)) {
      return "Mobile Number must be digits";
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return "Password is required";
    }

    final errors = <String>[];

    if (value.length < 8) {
      errors.add("at least 8 characters");
    }

    if (!value.contains(RegExp(r'[A-Z]'))) {
      errors.add("one uppercase letter (A-Z)");
    }

    if (!value.contains(RegExp(r'[a-z]'))) {
      errors.add("one lowercase letter (a-z)");
    }

    if (!value.contains(RegExp(r'[0-9]'))) {
      errors.add("one number (0-9)");
    }

    if (!value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      errors.add("one special character (!@#\$%^&* etc.)");
    }

    if (errors.isNotEmpty) {
      return "Password must contain: ${errors.join(", ")}";
    }

    return null;
  }

  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return "Name is Required";
    }
    return null;
  }

  static String? validateNumber(String? value) {
    if (value == null || value.isEmpty) {
      return "This field is required";
    }
    const pattern = r'^[0-9]+$';
    final regExp = RegExp(pattern);
    if (!regExp.hasMatch(value)) {
      return "Value must be [0-9]";
    }
    return null;
  }

  static String? validateEmpty(String? value) {
    if (value == null || value.isEmpty) {
      return "This field is required";
    }
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return "Email is Required";
    }
    const pattern =
        r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
    final regExp = RegExp(pattern);
    if (!regExp.hasMatch(value)) {
      return "Invalid Email";
    }
    return null;
  }

  //title with max length 126

  static String? validateTitle(String? value) {
    if (value == null || value.isEmpty) {
      return "Title is Required";
    }
    // const pattern = r'(^[a-zA-Z .]*$)';
    // final regExp = RegExp(pattern);
    // if (!regExp.hasMatch(value)) {
    //   return "Title must be a-z, A-Z,";
    // }
    if (value.length < 5) {
      return "Title must be at least 5 characters";
    }
    if (value.length > 126) {
      return "Title must be less than 126 characters";
    }
    return null;
  }

  static String? validateDescription(String? value) {
    if (value == null || value.isEmpty) {
      return "Description is Required";
    }
    if (value.length < 5) {
      return "Description must be at least 5 characters";
    }
    return null;
  }

  static String? nullValidate({
    String? value,
    String? title = 'This field',
    bool? isReqChar = false,
  }) {
    if (value == null || value.isEmpty) {
      return "$title is Required";
    }

    if (isReqChar == true && value.length < 5) {
      return "$title must be at least 5 characters";
    }
    return null;
  }
}
