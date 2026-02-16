import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:orgservice/core/controller/bloc/global/global_bloc.dart';
import '../../../app/theme/theme.dart';
import '../../../shared/widgets/custom_page_scaffold.dart';
import '../../../shared/widgets/loading.dart';
import '../controller/bloc/profile_bloc.dart';
import 'account_settings.dart';
import 'personal_details_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late ProfileBloc _profileBloc;
  final Color backgroundColor = const Color(0xFFF9FAFB);
  final Color kCardColor = Colors.white;
  final Color dividerColor = const Color(0xFFEEEEEE);

  @override
  void initState() {
    super.initState();
    _profileBloc = BlocProvider.of<ProfileBloc>(context);
    _profileBloc.add(const FillProfileEvent());
  }

  @override
  void dispose() {
    _profileBloc.add(ProfileEventInit());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, ProfileState>(
      builder: (context, state) {
        return CustomPageScaffold(
          navigationBar: CupertinoNavigationBar(
            middle: Text(
              'Profile',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: kAccentColor,
              ),
            ),
            backgroundColor: kCardColor,
            border: Border(bottom: BorderSide(color: dividerColor, width: 0.5)),
          ),
          backgroundColor: kBackgroundColor,
          child: Processing(
            loading: state.isUpdating,
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  _buildProfileHeader(state),
                  SizedBox(height: 2.5.hs),
                  _buildSettingsSection(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileHeader(ProfileState state) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardColor,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13), // 0.05 * 255 ≈ 13
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: EdgeInsets.symmetric(vertical: 3.hs),
      child: Column(
        children: [
          // Profile Avatar Placeholder (without image)
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: kPrimaryColor.withAlpha(25), // 0.1 * 255 ≈ 25
              border: Border.all(
                color: kPrimaryColor.withAlpha(51), // 0.2 * 255 ≈ 51
                width: 2,
              ),
            ),
            child: Icon(
              CupertinoIcons.person_fill,
              size: 40,
              color: kPrimaryColor.withAlpha(128), // 0.5 * 255 = 128
            ),
          ),
          SizedBox(height: 1.5.hs),
          Text(
            state.userData?.name ?? "User Name",
            style: TextStyle(
              fontSize: 22.fs,
              fontWeight: FontWeight.bold,
              color: kAccentColor,
            ),
          ),
          if (state.userData?.email != null &&
              state.userData!.email!.isNotEmpty)
            Padding(
              padding: EdgeInsets.only(top: 0.5.hs),
              child: Text(
                state.userData?.email ?? "",
                style: TextStyle(fontSize: 14.fs, color: Colors.grey.shade600),
              ),
            ),
          SizedBox(height: 1.hs),
          _buildEditProfileButton(),
        ],
      ),
    );
  }

  Widget _buildEditProfileButton() {
    return GestureDetector(
      onTap: () {
        Get.to(() => const PersonalDetailsScreen());
      },
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 10.hs),
        padding: EdgeInsets.symmetric(vertical: 0.8.hs, horizontal: 2.hs),
        decoration: BoxDecoration(
          color: kPrimaryColor.withAlpha(25), // 0.1 * 255 ≈ 25
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(CupertinoIcons.pencil, size: 16, color: kPrimaryColor),
            SizedBox(width: 0.5.hs),
            Text(
              'Edit Profile',
              style: TextStyle(
                fontSize: 14.fs,
                fontWeight: FontWeight.w500,
                color: kPrimaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsSection() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 2.hs),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('Account'),
          _buildSettingsCard([
            _buildSettingTile(
              title: 'Personal Details',
              icon: CupertinoIcons.person,
              onTap: () {
                Get.to(() => const PersonalDetailsScreen());
              },
            ),
            _buildSettingTile(
              title: 'Account Settings',
              icon: CupertinoIcons.settings,
              onTap: () {
                Get.to(() => const AccountSettingsPage());
              },
            ),
            _buildSettingTile(
              title: 'Logout',
              icon: CupertinoIcons.square_arrow_right,
              iconColor: Colors.redAccent,
              textColor: Colors.redAccent,
              isLast: true,
              onTap: () {
                _showLogoutConfirmation();
              },
            ),
          ]),
          SizedBox(height: 2.hs),
          _buildSectionTitle('Support'),
          _buildSettingsCard([
            _buildSettingTile(
              title: 'Help Center',
              icon: CupertinoIcons.question_circle,
              onTap: () {
                // Implement help center navigation
              },
            ),
            _buildSettingTile(
              title: 'Privacy Policy',
              icon: CupertinoIcons.doc_text,
              onTap: () {
                // Implement privacy policy navigation
              },
            ),
            _buildSettingTile(
              title: 'Terms of Service',
              icon: CupertinoIcons.doc_plaintext,
              isLast: true,
              onTap: () {
                // Implement terms navigation
              },
            ),
          ]),
          SizedBox(height: 3.hs),
          Center(
            child: Text(
              'App Version 1.0.0',
              style: TextStyle(fontSize: 12.fs, color: Colors.grey.shade500),
            ),
          ),
          SizedBox(height: 2.hs),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(left: 0.5.hs, bottom: 1.hs),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16.fs,
          fontWeight: FontWeight.bold,
          color: kAccentColor,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: kCardColor,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8), // 0.03 * 255 ≈ 8
            blurRadius: 10,
            spreadRadius: 0,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingTile({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
    Color? iconColor,
    Color? textColor,
    bool isLast = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius:
            isLast
                ? const BorderRadius.only(
                  bottomLeft: Radius.circular(15),
                  bottomRight: Radius.circular(15),
                )
                : null,
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 1.5.hs, horizontal: 2.hs),
          decoration: BoxDecoration(
            border:
                !isLast
                    ? Border(bottom: BorderSide(color: dividerColor))
                    : null,
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (iconColor ?? kPrimaryColor).withAlpha(
                    25,
                  ), // 0.1 * 255 ≈ 25
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: iconColor ?? kPrimaryColor),
              ),
              SizedBox(width: 1.5.hs),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16.fs,
                    fontWeight: FontWeight.w500,
                    color: textColor ?? Colors.black87,
                  ),
                ),
              ),
              Icon(
                CupertinoIcons.chevron_right,
                size: 18,
                color: Colors.grey.shade400,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLogoutConfirmation() {
    showCupertinoDialog(
      context: context,
      builder:
          (context) => CupertinoAlertDialog(
            title: const Text('Logout'),
            content: const Text('Are you sure you want to logout?'),
            actions: [
              CupertinoDialogAction(
                child: const Text('Cancel'),
                onPressed: () => Navigator.pop(context),
              ),
              CupertinoDialogAction(
                isDestructiveAction: true,
                onPressed: () {
                  // Implement logout logic
                  Navigator.pop(context);
                  globalBloc.add(GlobalAuthLogoutEvent());
                },
                child: const Text('Logout'),
              ),
            ],
          ),
    );
  }
}
