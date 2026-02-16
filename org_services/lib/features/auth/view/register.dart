import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get_utils/src/extensions/string_extensions.dart';
import 'package:orgservice/app/theme/theme.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:orgservice/features/auth/controllers/bloc/auth_bloc.dart';
import 'package:orgservice/features/auth/models/auth_add_section.dart';
import '../../../app/utils/custom_validators.dart';
import '../../../app/utils/date_formatter.dart';
import '../../../shared/widgets/button/custom_button.dart';
import '../../../shared/widgets/custom_page_scaffold.dart';
import '../../../shared/widgets/datepicker/combined_date_picker.dart';
import '../../../shared/widgets/formfields/custom_cupertino_form_field.dart';

class RegisterPage extends StatefulWidget {
  static const String routeName = '/register';
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<CupertinoFormState>();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  // Form Controllers

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _orgIdController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _roleController = TextEditingController();
  final TextEditingController _contactNumberController =
      TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _genderController = TextEditingController();
  final TextEditingController _dobController = TextEditingController();
  final TextEditingController _ssnController = TextEditingController();

  final List<String> _genders = ['MALE', 'FEMALE', 'OTHER'];
  late AuthBloc authBloc;

  @override
  void initState() {
    super.initState();
    authBloc = BlocProvider.of<AuthBloc>(context);
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _roleController.dispose();
    _contactNumberController.dispose();
    _addressController.dispose();
    _genderController.dispose();
    _dobController.dispose();
    _ssnController.dispose();
    super.dispose();
  }

  Orgs? selectedOrg;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        return CustomPageScaffold(
          backgroundColor: kBackgroundColor,
          navigationBar: CupertinoNavigationBar(
            middle: Text(
              'Create Account',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: kAccentColor,
                fontSize: 18,
              ),
            ),
            backgroundColor: kBackgroundColor,
            border: Border(
              bottom: BorderSide(color: kDividerColor, width: 0.5),
            ),
            leading: CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => Navigator.pop(context),
              child: Icon(CupertinoIcons.back, color: kPrimaryColor),
            ),
          ),
          child: Stack(
            children: [
              FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child:
                      !state.isFetching && state.orgs.isEmpty
                          ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'No Organizations Available',
                                  style: TextStyle(
                                    color: kErrorColor,
                                    fontSize: 16,
                                  ),
                                ),
                                SizedBox(height: 16),
                                CustomButton.filled(
                                  text: 'Retry',
                                  isLoading: state.isFetching,
                                  backgroundColor: kPrimaryColor,
                                  onPressed: () {
                                    authBloc.add(GetAuthAddSectionListEvent());
                                  },
                                ),
                              ],
                            ),
                          )
                          : SingleChildScrollView(
                            physics: const BouncingScrollPhysics(),
                            child: Column(
                              children: [
                                _buildHeader(),
                                _buildFormContent(state: state),
                              ],
                            ),
                          ),
                ),
              ),
              if (state.isFetching || state.isSubmitting)
                Container(
                  color: Colors.black.withOpacity(0.3),
                  child: const Center(
                    child: CupertinoActivityIndicator(radius: 20),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: EdgeInsets.symmetric(vertical: 3.hs, horizontal: 2.hs),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kPrimaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              CupertinoIcons.person_add,
              size: 48,
              color: kPrimaryColor,
            ),
          ),
          SizedBox(height: 1.5.hs),
          Text(
            'Join Our Organization',
            style: TextStyle(
              fontSize: 24.fs,
              fontWeight: FontWeight.bold,
              color: kAccentColor,
            ),
          ),
          SizedBox(height: 0.5.hs),
          Text(
            'Fill in your details to create your account',
            style: TextStyle(fontSize: 14.fs, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _buildFormContent({required AuthState state}) {
    log(
      'Building Register Form with state: ${state.orgs.length} organizations available',
    );
    return Padding(
      padding: EdgeInsets.all(2.hs),
      child: CupertinoForm(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 1.hs),
            _buildSectionTitle('Choose Organization'),

            _buildFormCard([_buildOrganizationField()]),
            _buildSectionTitle('Personal Information'),
            _buildFormCard([
              _buildFormField(
                controller: _nameController,
                labelText: 'Full Name',
                icon: CupertinoIcons.person,
                validator: (value) => Validator.validateName(value),
              ),
              _buildFormField(
                controller: _emailController,
                labelText: 'Email Address',
                icon: CupertinoIcons.mail,
                keyboardType: TextInputType.emailAddress,
                validator: (value) => Validator.validateEmail(value),
              ),
              _buildFormField(
                controller: _contactNumberController,
                labelText: 'Contact Number',
                icon: CupertinoIcons.phone,
                keyboardType: TextInputType.phone,
                validator:
                    (value) => Validator.nullValidate(
                      title: 'Contact Number',
                      value: value,
                    ),
              ),
              _buildFormField(
                controller: _ssnController,
                labelText: 'SSN',
                icon: CupertinoIcons.number,
                keyboardType: TextInputType.number,
                validator:
                    (value) =>
                        Validator.nullValidate(title: 'SSN', value: value),
              ),
            ]),
            SizedBox(height: 2.hs),
            _buildSectionTitle('Additional Details'),
            _buildFormCard([
              _buildGenderField(),
              _buildDateField(),
              _buildFormField(
                controller: _addressController,
                labelText: 'Address',
                icon: CupertinoIcons.location,
                maxLines: 3,
                validator:
                    (value) =>
                        Validator.nullValidate(title: 'Address', value: value),
              ),
            ]),
            SizedBox(height: 2.hs),
            _buildSectionTitle('Professional Information'),
            _buildFormCard([
              _buildFormField(
                controller: _roleController,
                labelText: 'Job Role',
                icon: CupertinoIcons.briefcase,
                validator:
                    (value) =>
                        Validator.nullValidate(title: 'Job Role', value: value),
              ),
            ]),
            SizedBox(height: 3.hs),
            _buildRegisterButton(),
            SizedBox(height: 2.hs),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(left: 0.5.hs, bottom: 1.hs),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 18.fs,
          fontWeight: FontWeight.bold,
          color: kAccentColor,
        ),
      ),
    );
  }

  Widget _buildFormCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            spreadRadius: 0,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(1.5.hs),
        child: Column(
          children:
              children.map((child) {
                final index = children.indexOf(child);
                return Column(
                  children: [
                    child,
                    if (index < children.length - 1) SizedBox(height: 1.5.hs),
                  ],
                );
              }).toList(),
        ),
      ),
    );
  }

  Widget _buildFormField({
    required TextEditingController controller,
    required String labelText,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    int maxLines = 1,
    VoidCallback? onTap,
    bool isReadOnly = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: kDividerColor, width: 1),
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 1.5.hs, vertical: 0.5.hs),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: kPrimaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 20, color: kPrimaryColor),
            ),
            SizedBox(width: 1.hs),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    labelText,
                    style: TextStyle(
                      fontSize: 12.fs,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  SizedBox(height: 0.3.hs),
                  CupertinoFormField(
                    controller: controller,
                    validator: validator,
                    keyboardType: keyboardType,
                    maxLines: maxLines,
                    isReadOnly: isReadOnly,
                    onTap: onTap,
                    inputStyle: TextStyle(
                      fontSize: 16.fs,
                      fontWeight: FontWeight.w500,
                      color: kAccentColor,
                    ),
                    hintText: 'Enter $labelText',
                    placeholderStyle: TextStyle(
                      fontSize: 16.fs,
                      color: Colors.grey.shade400,
                    ),
                  ),
                ],
              ),
            ),
            if (isReadOnly && onTap != null)
              Icon(
                CupertinoIcons.chevron_down,
                size: 16,
                color: Colors.grey.shade400,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrganizationField() {
    return Container(
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: kDividerColor, width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(15),
          onTap: () {
            showCupertinoModalPopup(
              context: context,
              builder: (context) {
                final state = BlocProvider.of<AuthBloc>(context).state;
                return Container(
                  decoration: BoxDecoration(
                    color: kBackgroundColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  child: CupertinoActionSheet(
                    title: Text(
                      'Select Organization',
                      style: TextStyle(
                        fontSize: 18.fs,
                        fontWeight: FontWeight.w600,
                        color: kAccentColor,
                      ),
                    ),
                    actions:
                        state.orgs.map((section) {
                          return CupertinoActionSheetAction(
                            onPressed: () {
                              setState(() {
                                selectedOrg = section;
                                _orgIdController.text = section.orgName ?? "";
                              });
                              Navigator.pop(context);
                            },
                            child: Text(
                              section.orgName?.capitalizeFirst ?? "",
                              style: TextStyle(
                                fontSize: 16.fs,
                                fontWeight: FontWeight.w500,
                                color: kPrimaryColor,
                              ),
                            ),
                          );
                        }).toList(),
                    cancelButton: CupertinoActionSheetAction(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Cancel',
                        style: TextStyle(
                          fontSize: 16.fs,
                          fontWeight: FontWeight.w600,
                          color: Colors.red,
                        ),
                      ),
                    ),
                  ),
                );
              },
            );
          },
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 1.5.hs, vertical: 1.2.hs),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: kPrimaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    CupertinoIcons.building_2_fill,
                    size: 20,
                    color: kPrimaryColor,
                  ),
                ),
                SizedBox(width: 1.hs),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Organization Name',
                        style: TextStyle(
                          fontSize: 12.fs,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      SizedBox(height: 0.3.hs),
                      Text(
                        _orgIdController.text.isNotEmpty
                            ? _orgIdController.text.capitalizeFirst ?? ""
                            : 'Select Organization',
                        style: TextStyle(
                          fontSize: 16.fs,
                          fontWeight: FontWeight.w500,
                          color:
                              _orgIdController.text.isNotEmpty
                                  ? kAccentColor
                                  : Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  CupertinoIcons.chevron_down,
                  size: 16,
                  color: Colors.grey.shade400,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGenderField() {
    return Container(
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: kDividerColor, width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(15),
          onTap: () => _showGenderSelection(),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 1.5.hs, vertical: 1.2.hs),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: kPrimaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    CupertinoIcons.person_2,
                    size: 20,
                    color: kPrimaryColor,
                  ),
                ),
                SizedBox(width: 1.hs),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Gender',
                        style: TextStyle(
                          fontSize: 12.fs,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      SizedBox(height: 0.3.hs),
                      Text(
                        _genderController.text.isNotEmpty
                            ? _genderController.text
                                    .toLowerCase()
                                    .capitalizeFirst ??
                                ""
                            : 'Select Gender',
                        style: TextStyle(
                          fontSize: 16.fs,
                          fontWeight: FontWeight.w500,
                          color:
                              _genderController.text.isNotEmpty
                                  ? kAccentColor
                                  : Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  CupertinoIcons.chevron_down,
                  size: 16,
                  color: Colors.grey.shade400,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDateField() {
    return Container(
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: kDividerColor, width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(15),
          onTap: () => _showDatePicker(),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 1.5.hs, vertical: 1.2.hs),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: kPrimaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    CupertinoIcons.calendar,
                    size: 20,
                    color: kPrimaryColor,
                  ),
                ),
                SizedBox(width: 1.hs),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Date of Birth',
                        style: TextStyle(
                          fontSize: 12.fs,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      SizedBox(height: 0.3.hs),
                      Text(
                        _dobController.text.isNotEmpty
                            ? DateFormatter.formatStringDate(
                              _dobController.text,
                            )
                            : 'Select Date of Birth',
                        style: TextStyle(
                          fontSize: 16.fs,
                          fontWeight: FontWeight.w500,
                          color:
                              _dobController.text.isNotEmpty
                                  ? kAccentColor
                                  : Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  CupertinoIcons.chevron_down,
                  size: 16,
                  color: Colors.grey.shade400,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRegisterButton() {
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [kPrimaryColor, kAccentColor],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: kPrimaryColor.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: _handleRegister,
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.person_add, color: Colors.white, size: 20),
                SizedBox(width: 0.8.hs),
                Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 18.fs,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showGenderSelection() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: kBackgroundColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: CupertinoActionSheet(
            title: Text(
              'Select Gender',
              style: TextStyle(
                fontSize: 18.fs,
                fontWeight: FontWeight.w600,
                color: kAccentColor,
              ),
            ),
            actions:
                _genders.map((gender) {
                  return CupertinoActionSheetAction(
                    onPressed: () {
                      setState(() {
                        _genderController.text = gender;
                      });
                      Navigator.pop(context);
                    },
                    child: Text(
                      gender.toLowerCase().capitalizeFirst ?? "",
                      style: TextStyle(
                        fontSize: 16.fs,
                        fontWeight: FontWeight.w500,
                        color: kPrimaryColor,
                      ),
                    ),
                  );
                }).toList(),
            cancelButton: CupertinoActionSheetAction(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Cancel',
                style: TextStyle(
                  fontSize: 16.fs,
                  fontWeight: FontWeight.w600,
                  color: Colors.red,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showDatePicker() {
    showCustomDatePicker(
      context,
      initialDate:
          _dobController.text.isNotEmpty
              ? DateTime.parse(_dobController.text)
              : null,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      onDateSelected: (date) {
        setState(() {
          _dobController.text = date.toLocal().toString();
        });
      },
    );
  }

  void _handleRegister() {
    if (_formKey.currentState!.validate()) {
      if (_orgIdController.text.isEmpty) {
        _showErrorDialog('Organization is Required');
      }
      if (_genderController.text.isEmpty) {
        _showErrorDialog('Please select your gender');
        return;
      }
      if (_dobController.text.isEmpty) {
        _showErrorDialog('Please select your date of birth');
        return;
      }
      final registrationData = {
        "orgId": selectedOrg?.id ?? "",
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'role': _roleController.text.trim(),
        'contactNumber': _contactNumberController.text.trim(),
        'address': _addressController.text.trim(),
        'gender': _genderController.text,
        'dob': _dobController.text,
        'ssn': _ssnController.text.trim(),
      };
      authBloc.add(RegisterSubmitEvent(data: registrationData));
    }
  }

  void _showErrorDialog(String message) {
    showCupertinoDialog(
      context: context,
      builder: (context) {
        return CupertinoAlertDialog(
          title: const Text('Error'),
          content: Text(message),
          actions: [
            CupertinoDialogAction(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }
}
