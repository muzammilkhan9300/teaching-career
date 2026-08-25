(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var toggle = document.getElementById('tc-nav-toggle');
		var nav = document.getElementById('tc-nav');

		if (toggle && nav) {
			toggle.addEventListener('click', function () {
				var isOpen = nav.classList.toggle('is-open');
				toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			});
		}

		// On small screens, tapping a dropdown parent link opens the submenu
		// instead of navigating, matching how the desktop hover menu behaves.
		var dropdownParents = document.querySelectorAll('.tc-nav__item--dropdown > a');
		dropdownParents.forEach(function (link) {
			link.addEventListener('click', function (e) {
				if (window.innerWidth <= 1080) {
					var parentItem = link.parentElement;
					var alreadyOpen = parentItem.classList.contains('is-open');

					if (!alreadyOpen) {
						e.preventDefault();
						document.querySelectorAll('.tc-nav__item--dropdown.is-open').forEach(function (openItem) {
							if (openItem !== parentItem) {
								openItem.classList.remove('is-open');
							}
						});
						parentItem.classList.add('is-open');
					}
				}
			});
		});

		// Hero image slider — rotates slides every 5s and supports dot
		// navigation. Only the image content changes; the container,
		// background blob, and everything else in the approved Hero is
		// untouched by this.
		var heroSlides = document.querySelectorAll('#heroSlides .tc-hero__slide');
		var heroDots = document.querySelectorAll('#heroDots .tc-hero__slide-dot');
		var heroCurrentIndex = 0;
		var heroInterval = null;

		function showHeroSlide(index) {
			if (!heroSlides.length) {
				return;
			}
			heroSlides.forEach(function (slide, i) {
				slide.classList.toggle('is-active', i === index);
			});
			heroDots.forEach(function (dot, i) {
				dot.classList.toggle('is-active', i === index);
			});
			heroCurrentIndex = index;
		}

		function startHeroAutoplay() {
			if (heroSlides.length < 2) {
				return;
			}
			heroInterval = window.setInterval(function () {
				showHeroSlide((heroCurrentIndex + 1) % heroSlides.length);
			}, 5000);
		}

		if (heroSlides.length) {
			heroDots.forEach(function (dot) {
				dot.addEventListener('click', function () {
					var target = parseInt(dot.getAttribute('data-slide-target'), 10);
					showHeroSlide(target);
					if (heroInterval) {
						window.clearInterval(heroInterval);
					}
					startHeroAutoplay();
				});
			});
			startHeroAutoplay();
		}

		// Candidate Registration form — conditional fields + a UX-only
		// client-side check (the authoritative validation happens on the
		// server once this is converted to WordPress).
		var candidateForm = document.getElementById('candidateForm');
		if (candidateForm) {
			var fresherRadios = document.querySelectorAll('input[name="is_fresher"]');
			var experienceFields = document.getElementById('experienceFields');
			var experienceDoc = document.getElementById('c-exp-doc');

			function updateFresherState() {
				var isNonFresher = document.getElementById('fresher-no').checked;
				if (experienceFields) {
					experienceFields.classList.toggle('tc-form-conditional--visible', isNonFresher);
				}
				if (experienceDoc) {
					experienceDoc.required = isNonFresher;
				}
			}
			fresherRadios.forEach(function (r) { r.addEventListener('change', updateFresherState); });
			updateFresherState();

			var homeTuitionCheckbox = document.getElementById('teach-home');
			var homeTuitionNote = document.getElementById('homeTuitionNote');

			function updateHomeTuitionState() {
				var checked = homeTuitionCheckbox && homeTuitionCheckbox.checked;
				if (homeTuitionNote) {
					homeTuitionNote.classList.toggle('tc-form-conditional--visible', checked);
				}
			}
			if (homeTuitionCheckbox) {
				homeTuitionCheckbox.addEventListener('change', updateHomeTuitionState);
			}
			updateHomeTuitionState();

			var subjectOtherCheckbox = document.getElementById('subj-9');
			var otherSubjectField = document.getElementById('otherSubjectField');

			function updateOtherSubjectState() {
				var checked = subjectOtherCheckbox && subjectOtherCheckbox.checked;
				if (otherSubjectField) {
					otherSubjectField.classList.toggle('tc-form-conditional--visible', checked);
				}
			}
			if (subjectOtherCheckbox) {
				subjectOtherCheckbox.addEventListener('change', updateOtherSubjectState);
			}
			updateOtherSubjectState();

			var classOtherCheckbox = document.getElementById('cls-6');
			var otherClassField = document.getElementById('otherClassField');

			function updateOtherClassState() {
				var checked = classOtherCheckbox && classOtherCheckbox.checked;
				if (otherClassField) {
					otherClassField.classList.toggle('tc-form-conditional--visible', checked);
				}
			}
			if (classOtherCheckbox) {
				classOtherCheckbox.addEventListener('change', updateOtherClassState);
			}
			updateOtherClassState();
		}
		// Form submission, validation, and demo localStorage handling for
		// every form on the site lives in js/forms.js.
	});
})();
