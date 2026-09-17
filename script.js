/**
 * AttendMate / AttendWise - Modern Attendance Calculator Engine
 * Handles real-time attendance predictions, target lecture calculations,
 * and responsive navigation transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Navigation & View Switcher (Home <-> About Us)
  // -------------------------------------------------------------
  const navLinks = document.querySelectorAll('[data-view-target]');
  const pageViews = document.querySelectorAll('.page-view');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  function switchView(viewId) {
    pageViews.forEach(view => {
      if (view.id === viewId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute('data-view-target') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer on navigation
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view-target');
      if (targetView) {
        switchView(targetView);
        history.replaceState(null, '', '#' + (targetView === 'homeView' ? 'home' : 'about'));
      }
    });
  });

  // Handle URL hash on initial load
  if (window.location.hash === '#about') {
    switchView('aboutView');
  } else {
    switchView('homeView');
  }

  // Mobile menu toggle
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Quick CTA smooth scroll to calculators
  const scrollBtns = document.querySelectorAll('[data-scroll-to]');
  scrollBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('homeView');
      const targetId = btn.getAttribute('data-scroll-to');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // -------------------------------------------------------------
  // 2. Calculator 1: Future Attendance Predictor
  // -------------------------------------------------------------
  const c1Total = document.getElementById('c1_total');
  const c1Present = document.getElementById('c1_present');
  const c1Absent = document.getElementById('c1_absent');
  const c1Upcoming = document.getElementById('c1_upcoming');
  const c1AttendedUpcoming = document.getElementById('c1_attended_upcoming');
  const c1ResetBtn = document.getElementById('c1_reset');

  // Outputs
  const c1Banner = document.getElementById('c1_outcome_banner');
  const c1OutcomeText = document.getElementById('c1_outcome_text');
  const c1OutcomeSub = document.getElementById('c1_outcome_sub');
  const c1CurrentPercent = document.getElementById('c1_current_percent');
  const c1FuturePercent = document.getElementById('c1_future_percent');
  const c1ChangeVal = document.getElementById('c1_change_val');
  const c1ProjectedRatio = document.getElementById('c1_projected_ratio');
  const c1ProgressBar = document.getElementById('c1_progress_bar');
  const c1StatusTag = document.getElementById('c1_status_tag');

  function calculateFutureAttendance() {
    let total = parseFloat(c1Total.value);
    let present = parseFloat(c1Present.value);
    let upcoming = parseFloat(c1Upcoming.value);
    let attendedUpcoming = parseFloat(c1AttendedUpcoming.value);

    // Default safe fallbacks if empty or invalid
    if (isNaN(total) || total <= 0) total = 0;
    if (isNaN(present) || present < 0) present = 0;
    if (isNaN(upcoming) || upcoming < 0) upcoming = 0;
    if (isNaN(attendedUpcoming) || attendedUpcoming < 0) attendedUpcoming = 0;

    // Constrain attended upcoming <= upcoming
    if (attendedUpcoming > upcoming) {
      attendedUpcoming = upcoming;
      c1AttendedUpcoming.value = upcoming;
    }

    // Update absent field automatically
    const absent = Math.max(0, total - present);
    if (c1Absent) c1Absent.value = absent;

    if (total === 0) {
      c1Banner.className = 'outcome-banner neutral';
      c1OutcomeText.textContent = 'Please enter total lectures to begin.';
      c1OutcomeSub.textContent = 'Enter your total and present lectures till date.';
      c1CurrentPercent.textContent = '0.00%';
      c1FuturePercent.textContent = '0.00%';
      c1ChangeVal.textContent = '0.00%';
      c1ProjectedRatio.textContent = '0 / 0';
      c1ProgressBar.style.width = '0%';
      c1ProgressBar.className = 'progress-fill';
      c1StatusTag.textContent = 'Awaiting Input';
      return;
    }

    if (present > total) {
      c1Banner.className = 'outcome-banner danger';
      c1OutcomeText.textContent = 'Present lectures cannot exceed total lectures.';
      c1OutcomeSub.textContent = 'Please check and correct your values.';
      c1CurrentPercent.textContent = '--';
      c1FuturePercent.textContent = '--';
      c1ChangeVal.textContent = '--';
      c1ProjectedRatio.textContent = `${present} / ${total}`;
      c1ProgressBar.style.width = '0%';
      c1StatusTag.textContent = 'Invalid Input';
      return;
    }

    // Formulas as specified:
    // Current Attendance = (Present / Total) × 100
    // Future Total = Total + Upcoming Lectures
    // Future Present = Present + Attended Upcoming Lectures
    // Future Attendance = (Future Present / Future Total) × 100
    // Percentage Change = Future Attendance - Current Attendance
    const currentAttendance = (present / total) * 100;
    const futureTotal = total + upcoming;
    const futurePresent = present + attendedUpcoming;
    const futureAttendance = (futurePresent / futureTotal) * 100;
    const percentageChange = futureAttendance - currentAttendance;

    const formattedCurrent = currentAttendance.toFixed(2);
    const formattedFuture = futureAttendance.toFixed(2);
    const formattedChange = Math.abs(percentageChange).toFixed(2);

    c1CurrentPercent.textContent = `${formattedCurrent}%`;
    c1FuturePercent.textContent = `${formattedFuture}%`;
    c1ProjectedRatio.textContent = `${futurePresent} / ${futureTotal}`;

    // Update progress bar
    const progressWidth = Math.min(100, Math.max(0, futureAttendance));
    c1ProgressBar.style.width = `${progressWidth}%`;
    if (futureAttendance >= 75) {
      c1ProgressBar.className = 'progress-fill success';
    } else if (futureAttendance >= 60) {
      c1ProgressBar.className = 'progress-fill warning';
    } else {
      c1ProgressBar.className = 'progress-fill danger';
    }

    // Dynamic message logic as requested:
    // If Percentage Change > 0: "You will gain X percentage points"
    // If Percentage Change < 0: "You will lose X percentage points"
    // If Percentage Change = 0: "Your attendance percentage will remain unchanged"
    if (percentageChange > 0.001) {
      c1Banner.className = 'outcome-banner gain';
      c1OutcomeText.textContent = `You will gain ${formattedChange} percentage points`;
      c1OutcomeSub.textContent = `Attending ${attendedUpcoming} out of ${upcoming} upcoming lectures will lift your attendance from ${formattedCurrent}% to ${formattedFuture}%.`;
      c1ChangeVal.textContent = `+${formattedChange}%`;
      c1ChangeVal.style.color = 'var(--color-success)';
      c1StatusTag.textContent = 'Positive Gain';
    } else if (percentageChange < -0.001) {
      c1Banner.className = 'outcome-banner loss';
      c1OutcomeText.textContent = `You will lose ${formattedChange} percentage points`;
      c1OutcomeSub.textContent = `Attending only ${attendedUpcoming} of ${upcoming} upcoming classes will lower your attendance from ${formattedCurrent}% to ${formattedFuture}%.`;
      c1ChangeVal.textContent = `-${formattedChange}%`;
      c1ChangeVal.style.color = 'var(--color-danger)';
      c1StatusTag.textContent = 'Attendance Drop';
    } else {
      c1Banner.className = 'outcome-banner neutral';
      c1OutcomeText.textContent = 'Your attendance percentage will remain unchanged';
      c1OutcomeSub.textContent = `Your projected attendance will remain steady at ${formattedFuture}%.`;
      c1ChangeVal.textContent = `0.00%`;
      c1ChangeVal.style.color = 'var(--color-text-main)';
      c1StatusTag.textContent = 'Unchanged';
    }
  }

  // Event listeners for Calc 1
  [c1Total, c1Present, c1Upcoming, c1AttendedUpcoming].forEach(input => {
    input?.addEventListener('input', calculateFutureAttendance);
  });

  // Sync absent input if user enters absent directly
  c1Absent?.addEventListener('input', () => {
    const total = parseFloat(c1Total.value) || 0;
    const absent = parseFloat(c1Absent.value) || 0;
    if (total >= absent) {
      c1Present.value = total - absent;
      calculateFutureAttendance();
    }
  });

  c1ResetBtn?.addEventListener('click', () => {
    c1Total.value = '40';
    c1Present.value = '28';
    c1Absent.value = '12';
    c1Upcoming.value = '10';
    c1AttendedUpcoming.value = '10';
    calculateFutureAttendance();
  });

  // Quick preset helper buttons
  const c1AttendAllBtn = document.getElementById('c1_attend_all');
  const c1MissAllBtn = document.getElementById('c1_miss_all');

  c1AttendAllBtn?.addEventListener('click', () => {
    c1AttendedUpcoming.value = c1Upcoming.value;
    calculateFutureAttendance();
  });

  c1MissAllBtn?.addEventListener('click', () => {
    c1AttendedUpcoming.value = '0';
    calculateFutureAttendance();
  });

  // -------------------------------------------------------------
  // 3. Calculator 2: Lectures Required to Reach Target Attendance
  // -------------------------------------------------------------
  const c2Total = document.getElementById('c2_total');
  const c2Present = document.getElementById('c2_present');
  const c2Absent = document.getElementById('c2_absent');
  const c2Target = document.getElementById('c2_target');
  const c2ResetBtn = document.getElementById('c2_reset');
  const targetChips = document.querySelectorAll('.chip-btn[data-target-val]');

  // Outputs
  const c2Banner = document.getElementById('c2_outcome_banner');
  const c2OutcomeText = document.getElementById('c2_outcome_text');
  const c2OutcomeSub = document.getElementById('c2_outcome_sub');
  const c2CurrentPercent = document.getElementById('c2_current_percent');
  const c2TargetPercent = document.getElementById('c2_target_percent');
  const c2LecturesReqVal = document.getElementById('c2_lectures_req_val');
  const c2SafeBunksVal = document.getElementById('c2_safe_bunks_val');
  const c2ProgressBar = document.getElementById('c2_progress_bar');
  const c2StatusTag = document.getElementById('c2_status_tag');

  function calculateTargetAttendance() {
    let total = parseFloat(c2Total.value);
    let present = parseFloat(c2Present.value);
    let target = parseFloat(c2Target.value);

    // Keep absent synchronized
    if (!isNaN(total) && !isNaN(present) && total >= present) {
      if (c2Absent) c2Absent.value = Math.max(0, total - present);
    }

    if (isNaN(total) || total <= 0) total = 0;
    if (isNaN(present) || present < 0) present = 0;
    if (isNaN(target) || target <= 0) target = 75;

    // Clamp target between 1 and 100
    if (target > 100) {
      target = 100;
      c2Target.value = '100';
    }

    // Highlight matching chip
    targetChips.forEach(chip => {
      if (parseFloat(chip.getAttribute('data-target-val')) === target) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    if (total === 0) {
      c2Banner.className = 'outcome-banner neutral';
      c2OutcomeText.textContent = 'Enter your current total and present lectures.';
      c2OutcomeSub.textContent = 'We will calculate how many consecutive lectures you need.';
      c2CurrentPercent.textContent = '0.00%';
      c2TargetPercent.textContent = `${target}%`;
      c2LecturesReqVal.textContent = '0';
      c2SafeBunksVal.textContent = '0';
      c2ProgressBar.style.width = '0%';
      c2StatusTag.textContent = 'Awaiting Input';
      return;
    }

    if (present > total) {
      c2Banner.className = 'outcome-banner danger';
      c2OutcomeText.textContent = 'Present lectures cannot exceed total lectures.';
      c2OutcomeSub.textContent = 'Please check your attendance numbers.';
      c2CurrentPercent.textContent = '--';
      c2TargetPercent.textContent = `${target}%`;
      c2LecturesReqVal.textContent = '--';
      c2SafeBunksVal.textContent = '--';
      c2ProgressBar.style.width = '0%';
      c2StatusTag.textContent = 'Invalid Input';
      return;
    }

    // Universal Formula as specified:
    // Current Attendance = (Present / Total) × 100
    // Target Rate = Target Attendance / 100
    // Lectures Required = ((Target Rate × Total) - Present) / (1 - Target Rate)
    // Round Lectures Required UP to the next whole number
    const currentAttendance = (present / total) * 100;
    const targetRate = target / 100;

    c2CurrentPercent.textContent = `${currentAttendance.toFixed(2)}%`;
    c2TargetPercent.textContent = `${target}%`;

    const progressWidth = Math.min(100, (currentAttendance / target) * 100);
    c2ProgressBar.style.width = `${progressWidth}%`;

    // Dynamic display as requested:
    // If Current Attendance >= Target Attendance:
    //     "You have already achieved your target attendance"
    // If Current Attendance < Target Attendance:
    //     "You need to attend X more lectures to reach your target attendance"
    if (currentAttendance >= target) {
      // Bonus helpful calculation: Safe classes that can be missed
      let safeBunks = 0;
      if (targetRate > 0) {
        safeBunks = Math.floor((present - (targetRate * total)) / targetRate);
      }
      if (safeBunks < 0) safeBunks = 0;

      c2Banner.className = 'outcome-banner achieved';
      c2OutcomeText.textContent = 'You have already achieved your target attendance';
      c2OutcomeSub.textContent = `Your attendance of ${currentAttendance.toFixed(2)}% surpasses your ${target}% target! You can safely miss up to ${safeBunks} upcoming class${safeBunks === 1 ? '' : 'es'} without dropping below your target.`;
      c2LecturesReqVal.textContent = '0';
      c2SafeBunksVal.textContent = `${safeBunks} classes`;
      c2ProgressBar.className = 'progress-fill success';
      c2StatusTag.textContent = 'Target Met';
    } else {
      // If Target is 100% and student has missed at least 1 class, 100% is mathematically unreachable
      if (target === 100 && present < total) {
        c2Banner.className = 'outcome-banner danger';
        c2OutcomeText.textContent = '100% attendance cannot be achieved';
        c2OutcomeSub.textContent = `Since you have already missed ${total - present} lecture(s), 100% attendance is mathematically impossible. Consider setting a target of 90% or 95%.`;
        c2LecturesReqVal.textContent = 'N/A';
        c2SafeBunksVal.textContent = '0';
        c2ProgressBar.className = 'progress-fill danger';
        c2StatusTag.textContent = 'Target Unreachable';
        return;
      }

      // Calculate Lectures Required
      const numerator = (targetRate * total) - present;
      const denominator = 1 - targetRate;
      const rawLecturesRequired = numerator / denominator;
      const lecturesRequired = Math.ceil(Math.max(0, rawLecturesRequired));

      const futurePresent = present + lecturesRequired;
      const futureTotal = total + lecturesRequired;
      const reachedPercentage = ((futurePresent / futureTotal) * 100).toFixed(2);

      c2Banner.className = 'outcome-banner needed';
      c2OutcomeText.textContent = `You need to attend ${lecturesRequired} more lectures to reach your target attendance`;
      c2OutcomeSub.textContent = `Attending the next ${lecturesRequired} consecutive classes will raise your record to ${futurePresent}/${futureTotal} (${reachedPercentage}%), successfully reaching your ${target}% goal.`;
      c2LecturesReqVal.textContent = `${lecturesRequired}`;
      c2SafeBunksVal.textContent = '0 (attend continuously)';
      c2ProgressBar.className = currentAttendance >= 60 ? 'progress-fill warning' : 'progress-fill danger';
      c2StatusTag.textContent = `${lecturesRequired} Needed`;
    }
  }

  // Event listeners for Calc 2
  [c2Total, c2Present, c2Target].forEach(input => {
    input?.addEventListener('input', calculateTargetAttendance);
  });

  c2Absent?.addEventListener('input', () => {
    const total = parseFloat(c2Total.value) || 0;
    const absent = parseFloat(c2Absent.value) || 0;
    if (total >= absent) {
      c2Present.value = total - absent;
      calculateTargetAttendance();
    }
  });

  targetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-target-val');
      if (val && c2Target) {
        c2Target.value = val;
        calculateTargetAttendance();
      }
    });
  });

  c2ResetBtn?.addEventListener('click', () => {
    c2Total.value = '50';
    c2Present.value = '32';
    c2Absent.value = '18';
    c2Target.value = '75';
    calculateTargetAttendance();
  });

  // -------------------------------------------------------------
  // 4. Interactive Accordion for FAQs
  // -------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Collapse all
      faqItems.forEach(i => i.classList.remove('active'));
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Initial Calculation Run
  calculateFutureAttendance();
  calculateTargetAttendance();
});
