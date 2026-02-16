import 'package:flutter/widgets.dart';
import 'package:orgservice/app/utils/size_config.dart';

import '../../../../app/theme/theme.dart';

class ErrorContainer extends StatelessWidget {
  final String errorMessage;
  const ErrorContainer({super.key, required this.errorMessage});

  @override
  Widget build(BuildContext context) {
    return errorMessage.isNotEmpty
        ? Padding(
          padding: EdgeInsets.symmetric(vertical: 1.hs),
          child: Container(
            width: double.maxFinite,
            padding: EdgeInsets.symmetric(vertical: 2.hs, horizontal: 12.0),
            decoration: BoxDecoration(
              color: kErrorColor.withAlpha(40),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                errorMessage,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: kErrorColor,

                  fontWeight: FontWeight.bold,
                  fontSize: smallFs,
                ),
              ),
            ),
          ),
        )
        : const SizedBox.shrink();
  }
}
