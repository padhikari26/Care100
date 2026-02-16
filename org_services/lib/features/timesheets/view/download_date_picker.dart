import 'package:flutter/material.dart';

import 'date_selector_row.dart';
import 'gradient_button.dart';

class DateRangePickerModal extends StatefulWidget {
  final Color primaryColor;

  const DateRangePickerModal({super.key, required this.primaryColor});

  @override
  State<DateRangePickerModal> createState() => _DateRangePickerModalState();
}

class _DateRangePickerModalState extends State<DateRangePickerModal>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late DateTimeRange _tempRange;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _slideAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );

    DateTime now = DateTime.now();
    _tempRange = DateTimeRange(
      start: now.subtract(const Duration(days: 6)),
      end: now,
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
    return AnimatedBuilder(
      animation: _slideAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value * 300),
          child: Container(
            margin: const EdgeInsets.only(top: 100),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            child: Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                left: 24,
                right: 24,
                top: 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 32),
                  _buildDateSelectors(),
                  const SizedBox(height: 32),
                  _buildDownloadButton(),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: widget.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.date_range_rounded,
                color: widget.primaryColor,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Select Date Range",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: Colors.grey[800],
                    ),
                  ),
                  Text(
                    "Maximum 7 days allowed",
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDateSelectors() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          DateSelectorRow(
            label: "From",
            date: _tempRange.start,
            primaryColor: widget.primaryColor,
            onDateSelected: _updateStartDate,
          ),
          const SizedBox(height: 16),
          DateSelectorRow(
            label: "To",
            date: _tempRange.end,
            primaryColor: widget.primaryColor,
            onDateSelected: _updateEndDate,
          ),
        ],
      ),
    );
  }

  Widget _buildDownloadButton() {
    return GradientButton(
      onPressed: () => Navigator.of(context).pop(_tempRange),
      primaryColor: widget.primaryColor,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.download_rounded, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          const Text(
            "Download Timesheet",
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  void _updateStartDate(DateTime picked) {
    DateTime newEnd = _tempRange.end;
    if (picked.isAfter(newEnd)) {
      newEnd = picked;
    }
    if (newEnd.difference(picked).inDays > 6) {
      newEnd = picked.add(const Duration(days: 6));
      if (newEnd.isAfter(DateTime.now())) {
        newEnd = DateTime.now();
      }
    }
    setState(() {
      _tempRange = DateTimeRange(start: picked, end: newEnd);
    });
  }

  void _updateEndDate(DateTime picked) {
    DateTime newStart = _tempRange.start;
    if (picked.difference(newStart).inDays > 6) {
      newStart = picked.subtract(const Duration(days: 6));
    }
    DateTime newEnd = picked.isAfter(DateTime.now()) ? DateTime.now() : picked;
    setState(() {
      _tempRange = DateTimeRange(start: newStart, end: newEnd);
    });
  }
}
