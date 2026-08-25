(function () {
	'use strict';

	// Sample candidate data (8 records). Real data will come from the
	// WordPress candidate query later — this JS-side pagination is just
	// for the front-end demo so the page-number clicks are functional now.
	var candidates = [
		{ id: 'c1', name: 'Muhammad Ali', role: 'Mathematics Teacher', loc: 'Lahore, Punjab', qual: 'M.Phil Mathematics', exp: '5 Years Experience', tags: ['School Teaching', 'O Level, A Level'], photo: 'assets/images/candidate-muhammad-ali.jpg' },
		{ id: 'c2', name: 'Ayesha Khan', role: 'English Teacher', loc: 'Islamabad, ICT', qual: 'M.A English Literature', exp: '4 Years Experience', tags: ['School Teaching', 'O Level'], photo: 'assets/images/candidate-ayesha-khan.jpg' },
		{ id: 'c3', name: 'Usman Tariq', role: 'Physics Teacher', loc: 'Rawalpindi, Punjab', qual: 'M.Sc Physics', exp: '6 Years Experience', tags: ['School Teaching', 'O Level, A Level'], photo: 'assets/images/candidate-usman-tariq.jpg' },
		{ id: 'c4', name: 'Sana Fatima', role: 'Biology Teacher', loc: 'Faisalabad, Punjab', qual: 'M.Sc Biology', exp: '3 Years Experience', tags: ['School Teaching', 'O Level'], photo: 'assets/images/candidate-sana-fatima.jpg' },
		{ id: 'c5', name: 'Bilal Ahmed', role: 'Chemistry Teacher', loc: 'Karachi, Sindh', qual: 'M.Sc Chemistry', exp: '4 Years Experience', tags: ['School Teaching', 'O Level, A Level'], photo: '' },
		{ id: 'c6', name: 'Hina Noreen', role: 'Urdu Teacher', loc: 'Multan, Punjab', qual: 'M.A Urdu', exp: '2 Years Experience', tags: ['School Teaching', 'Primary, Middle'], photo: 'assets/images/candidate-hina-noreen.jpg' },
		{ id: 'c7', name: 'Hamza Saeed', role: 'Computer Science Teacher', loc: 'Lahore, Punjab', qual: 'BS Computer Science', exp: '5 Years Experience', tags: ['School & Home Tuition', 'All Levels'], photo: 'assets/images/candidate-hamza-saeed.jpg' },
		{ id: 'c8', name: 'Sarah Javed', role: 'Home Tutor (Mathematics)', loc: 'Gujranwala, Punjab', qual: 'BS Mathematics', exp: '3 Years Experience', tags: ['Home Tuition', 'Primary to Matric'], photo: 'assets/images/candidate-sarah-javed.jpg' }
	];

	var PER_PAGE = 4;
	var TOTAL_GROUPS = Math.ceil(candidates.length / PER_PAGE); // 2 real groups of sample data
	var TOTAL_PAGES = 10; // matches the reference design's page numbers
	var currentPage = 1;

	var pinIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.8"/></svg>';
	var capIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L2 8.5 12 13l10-4.5L12 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 10.8V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	var clockIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	var verifiedIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/></svg>';
	var personIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 20c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

	function cardHtml(c) {
		var tagsHtml = c.tags.map(function (t) { return '<span class="tc-candidate-card__tag">' + t + '</span>'; }).join('');
		var photoHtml = c.photo
			? '<img src="' + c.photo + '" alt="' + c.name + '" loading="lazy" decoding="async">'
			: '<div class="tc-candidate-card__photo-placeholder" role="img" aria-label="' + c.name + ' — profile photo"></div>';
		return '' +
			'<div class="tc-candidate-card">' +
				'<div class="tc-candidate-card__photo">' +
					photoHtml +
					'<span class="tc-candidate-card__badge">' + verifiedIcon + ' Verified</span>' +
				'</div>' +
				'<div class="tc-candidate-card__body">' +
					'<h3 class="tc-candidate-card__name">' + c.name + '</h3>' +
					'<p class="tc-candidate-card__role">' + c.role + '</p>' +
					'<div class="tc-candidate-card__meta">' +
						'<span class="tc-candidate-card__meta-row">' + pinIcon + ' ' + c.loc + '</span>' +
						'<span class="tc-candidate-card__meta-row">' + capIcon + ' ' + c.qual + '</span>' +
						'<span class="tc-candidate-card__meta-row">' + clockIcon + ' ' + c.exp + '</span>' +
					'</div>' +
					'<div class="tc-candidate-card__tags">' + tagsHtml + '</div>' +
					'<div class="tc-candidate-card__cta">' +
						'<a href="candidate-profile-detail.html?id=' + c.id + '" class="tc-hero-btn tc-hero-btn--outline">' +
							'<span class="tc-hero-btn__icon tc-hero-btn__icon--outline" aria-hidden="true">' + personIcon + '</span>' +
							'<span class="tc-hero-btn__title">View Profile</span>' +
						'</a>' +
					'</div>' +
				'</div>' +
			'</div>';
	}

	function renderPage(page, isUserAction) {
		var grid = document.getElementById('candidatesGrid');
		if (!grid) { return; }

		// Cycle through the available sample groups so every page number is
		// clickable and shows a real set of 4 cards, even beyond the 8
		// sample records — this will be replaced by real query results
		// per page once connected to WordPress.
		var groupIndex = (page - 1) % TOTAL_GROUPS;
		var startIndex = groupIndex * PER_PAGE;
		var pageCandidates = candidates.slice(startIndex, startIndex + PER_PAGE);

		grid.innerHTML = pageCandidates.map(cardHtml).join('');
		currentPage = page;
		updatePaginationUI();

		// Only scroll when the user actively changes pages — never on the
		// initial page load. The page must open at the top (header,
		// breadcrumb, heading, banner, filters all visible first).
		if (isUserAction) {
			grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	function updatePaginationUI() {
		var pagination = document.getElementById('candidatesPagination');
		if (!pagination) { return; }

		var buttons = pagination.querySelectorAll('[data-page]');
		buttons.forEach(function (btn) {
			var btnPage = parseInt(btn.getAttribute('data-page'), 10);
			if (btnPage === currentPage) {
				btn.classList.add('tc-pagination__item--active');
				btn.setAttribute('aria-current', 'page');
			} else {
				btn.classList.remove('tc-pagination__item--active');
				btn.removeAttribute('aria-current');
			}
		});

		var prevBtn = pagination.querySelector('[data-page-nav="prev"]');
		var nextBtn = pagination.querySelector('[data-page-nav="next"]');
		if (prevBtn) { prevBtn.disabled = currentPage <= 1; }
		if (nextBtn) { nextBtn.disabled = currentPage >= TOTAL_PAGES; }
	}

	document.addEventListener('DOMContentLoaded', function () {
		var pagination = document.getElementById('candidatesPagination');
		if (!pagination) { return; }

		pagination.addEventListener('click', function (e) {
			var pageBtn = e.target.closest('[data-page]');
			if (pageBtn) {
				renderPage(parseInt(pageBtn.getAttribute('data-page'), 10), true);
				return;
			}
			var navBtn = e.target.closest('[data-page-nav]');
			if (navBtn) {
				var dir = navBtn.getAttribute('data-page-nav');
				var target = dir === 'prev' ? currentPage - 1 : currentPage + 1;
				if (target >= 1 && target <= TOTAL_PAGES) {
					renderPage(target, true);
				}
			}
		});

		renderPage(1, false);
	});
})();
