import 'dart:convert';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get_utils/src/extensions/string_extensions.dart';
import 'package:orgservice/app/theme/theme.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:syncfusion_flutter_signaturepad/signaturepad.dart';
import '../../../app/utils/custom_validators.dart';
import '../../../app/utils/date_formatter.dart';
import '../../../shared/widgets/custom_page_scaffold.dart';
import '../../../shared/widgets/datepicker/combined_date_picker.dart';
import '../../../shared/widgets/formfields/custom_cupertino_form_field.dart';
import '../../../shared/widgets/loading.dart';
import '../controller/bloc/profile_bloc.dart';

class PersonalDetailsScreen extends StatefulWidget {
  const PersonalDetailsScreen({super.key});

  @override
  State<PersonalDetailsScreen> createState() => _PersonalDetailsScreenState();
}

class _PersonalDetailsScreenState extends State<PersonalDetailsScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<CupertinoFormState>();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    profileBloc.add(FillProfileEvent());
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, ProfileState>(
      builder: (context, state) {
        return CustomPageScaffold(
          backgroundColor: kBackgroundColor,
          navigationBar: CupertinoNavigationBar(
            middle: Text(
              'Personal Details',
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
          child: Processing(
            loading: state.isUpdating,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    children: [_buildHeader(), _buildFormContent(state)],
                  ),
                ),
              ),
            ),
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
              CupertinoIcons.person_circle,
              size: 48,
              color: kPrimaryColor,
            ),
          ),
          SizedBox(height: 1.5.hs),
          Text(
            'Update Your Information',
            style: TextStyle(
              fontSize: 24.fs,
              fontWeight: FontWeight.bold,
              color: kAccentColor,
            ),
          ),
          SizedBox(height: 0.5.hs),
          Text(
            'Keep your personal details up to date',
            style: TextStyle(fontSize: 14.fs, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _buildFormContent(ProfileState state) {
    return Padding(
      padding: EdgeInsets.all(2.hs),
      child: CupertinoForm(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 1.hs),
            _buildSectionTitle('Basic Information'),
            _buildFormCard([
              _buildFormField(
                controller: state.nameController,
                labelText: 'Full Name',
                icon: CupertinoIcons.person,
                validator: (value) => Validator.validateName(value),
              ),
              _buildFormField(
                controller: TextEditingController(
                  text: state.emailController.text,
                ),
                labelText: 'Email Address',
                isReadOnly: true,
                icon: CupertinoIcons.mail,
                keyboardType: TextInputType.emailAddress,
                validator: (value) => Validator.validateEmail(value),
              ),
              _buildFormField(
                controller: state.contactNumberController,
                labelText: 'Contact Number',
                icon: CupertinoIcons.phone,
                keyboardType: TextInputType.phone,
                validator:
                    (value) => Validator.nullValidate(
                      title: 'Contact Number',
                      value: value,
                    ),
              ),
            ]),

            SizedBox(height: 2.hs),
            _buildSectionTitle('Personal Information'),
            _buildFormCard([
              _buildGenderField(state),
              _buildDateField(state),
              _buildFormField(
                controller: state.addressController,
                labelText: 'Address',
                icon: CupertinoIcons.location,
                maxLines: 3,
              ),
            ]),

            SizedBox(height: 2.hs),
            _buildSectionTitle('Professional Information'),
            _buildFormCard([
              _buildFormField(
                controller: state.roleController,
                labelText: 'Job Role',
                icon: CupertinoIcons.briefcase,
              ),
              // _buildFormField(
              //   controller: state.reportingToController,
              //   labelText: 'Reporting Manager',
              //   icon: CupertinoIcons.person_2,
              // ),
              _buildSignatureSection(state: state),
            ]),

            SizedBox(height: 3.hs),
            _buildUpdateButton(state),
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

  Widget _buildGenderField(ProfileState state) {
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
          onTap: () => _showGenderSelection(state),
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
                        state.genderController.text.isNotEmpty
                            ? state.genderController.text
                                    .toLowerCase()
                                    .capitalizeFirst ??
                                ""
                            : 'Select Gender',
                        style: TextStyle(
                          fontSize: 16.fs,
                          fontWeight: FontWeight.w500,
                          color:
                              state.genderController.text.isNotEmpty
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

  Widget _buildDateField(ProfileState state) {
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
          onTap: () => _showDatePicker(state),
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
                        state.dobController.text.isNotEmpty
                            ? DateFormatter.formatStringDate(
                              state.dobController.text,
                            )
                            : 'Select Date of Birth',
                        style: TextStyle(
                          fontSize: 16.fs,
                          fontWeight: FontWeight.w500,
                          color:
                              state.dobController.text.isNotEmpty
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

  Widget _buildUpdateButton(ProfileState state) {
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
          onTap: () {
            if (_formKey.currentState!.validate()) {
              context.read<ProfileBloc>().add(UpdateProfileEvent());
            }
          },
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  CupertinoIcons.checkmark_circle,
                  color: Colors.white,
                  size: 20,
                ),
                SizedBox(width: 0.8.hs),
                Text(
                  'Update Profile',
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

  void _showGenderSelection(ProfileState state) {
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
                state.genders.map((gender) {
                  return CupertinoActionSheetAction(
                    onPressed: () {
                      context.read<ProfileBloc>().add(
                        OnSelectGenderEvent(gender),
                      );
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

  void _showSignaturePad({required ProfileState state}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          decoration: BoxDecoration(
            color: kBackgroundColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CupertinoButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    Text(
                      'Signature',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    CupertinoButton(
                      onPressed: () async {
                        final signatureImage =
                            await state.signaturePadKey.currentState?.toImage();
                        if (signatureImage != null) {
                          final byteData = await signatureImage.toByteData(
                            format: ImageByteFormat.png,
                          );
                          final bytes = byteData!.buffer.asUint8List();
                          final base64Signature = base64Encode(bytes);
                          profileBloc.add(SetSignatureEvent(base64Signature));
                          Navigator.pop(context);
                        }
                      },
                      child: const Text('Save'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: SfSignaturePad(
                    key: state.signaturePadKey,
                    backgroundColor: Colors.white,
                    strokeColor: Colors.black,
                    minimumStrokeWidth: 2,
                    maximumStrokeWidth: 4,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    CupertinoButton(
                      onPressed: () {
                        state.signaturePadKey.currentState?.clear();
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(CupertinoIcons.clear, color: kErrorColor),
                          const SizedBox(width: 8),
                          Text('Clear', style: TextStyle(color: kErrorColor)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSignatureSection({required ProfileState state}) {
    return Container(
      decoration: BoxDecoration(
        color: kBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Signature'),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: () => _showSignaturePad(state: state),
              child: Container(
                width: double.infinity,
                height: 120,
                decoration: BoxDecoration(
                  color: kBackgroundColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child:
                    (state.signatureBase64.isNotEmpty)
                        ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.memory(
                            base64Decode(state.signatureBase64),
                            fit: BoxFit.contain,
                          ),
                        )
                        : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              CupertinoIcons.pencil_circle,
                              size: 32,
                              color: kSecondaryColor,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Tap to add signature',
                              style: TextStyle(
                                fontSize: 16,
                                color: kSecondaryColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
              ),
            ),
            if (state.signatureBase64.isNotEmpty) ...[
              const SizedBox(height: 12),
              Center(
                child: CupertinoButton(
                  onPressed: () {
                    profileBloc.add(SetSignatureEvent(""));
                  },
                  child: Text(
                    'Clear Signature',
                    style: TextStyle(color: kErrorColor),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showDatePicker(ProfileState state) {
    showCustomDatePicker(
      context,
      initialDate:
          state.dobController.text.isNotEmpty
              ? DateTime.parse(state.dobController.text)
              : null,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      onDateSelected: (date) {
        context.read<ProfileBloc>().add(
          OnChangeDOBEvent(date.toLocal().toString()),
        );
      },
    );
  }
}
