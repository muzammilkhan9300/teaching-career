(function () {
	'use strict';

	// Sample school data (6 records). Real data will come from the
	// WordPress school query later — this JS-side pagination is just
	// for the front-end demo so the page-number clicks are functional now.
	var schools = [
		{ id: 's1', name: 'Beacon School', tag: 'O Level', city: 'Lahore', subjects: 'Mathematics, Physics, English', photo: 'assets/images/School1.jpg' },
		{ id: 's2', name: 'Greenwood Academy', tag: 'A Level', city: 'Karachi', subjects: 'English, Computer Science, Business Studies', photo: 'assets/images/School2.jpg' },
		{ id: 's3', name: 'City Grammar School', tag: 'Federal', city: 'Islamabad', subjects: 'Physics, Chemistry, Biology', photo: 'assets/images/School3.jpg' },
		{ id: 's4', name: 'The Learning Hub', tag: 'O Level', city: 'Faisalabad', subjects: 'Mathematics, English, ICT', photo: 'assets/images/School5.jpg' },
		{ id: 's5', name: 'Rising Star Academy', tag: 'IB', city: 'Multan', subjects: 'Biology, Chemistry, Environmental Science', photo: 'assets/images/School6.jpg' },
		{ id: 's6', name: 'Sunrise Public School', tag: 'Punjab Board', city: 'Rawalpindi', subjects: 'Urdu, English, Social Studies', photo: 'assets/images/School7.jpg' }
	];

	var PER_PAGE = 4;
	var TOTAL_GROUPS = Math.ceil(schools.length / PER_PAGE); // 2 real groups of sample data
	var TOTAL_PAGES = 10; // matches the reference design's page numbers
	var currentPage = 1;

	var pinIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.8"/></svg>';
	var bookIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.5C6 4.5 9 4.5 11 5.5v13c-2-1-5-1-7 0v-13z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M20 5.5c-2-1-5-1-7 0v13c2-1 5-1 7 0v-13z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
	var checkIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	var crestIcon = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l7 3v6c0 4.9-3 8.4-7 10-4-1.6-7-5.1-7-10V5l7-3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

	function cardHtml(s) {
		var photoHtml = s.photo
			? '<img src="' + s.photo + '" alt="' + s.name + '" loading="lazy" decoding="async">'
			: '<div class="tc-school-card__photo-placeholder" role="img" aria-label="' + s.name + ' — school photo"></div>';
		return '' +
			'<a href="school-profile-detail.html?id=' + s.id + '" class="tc-school-card" style="text-decoration:none;display:block;">' +
				'<div class="tc-school-card__photo">' +
					photoHtml +
					'<span class="tc-school-card__badge">' + checkIcon + ' Registered</span>' +
				'</div>' +
				'<div class="tc-school-card__body">' +
					'<span class="tc-school-card__logo" aria-hidden="true">' + crestIcon + '</span>' +
					'<h3 class="tc-school-card__name">' + s.name + '</h3>' +
					'<span class="tc-school-card__tag">' + s.tag + '</span>' +
					'<div class="tc-school-card__meta">' +
						'<span class="tc-school-card__meta-row">' + pinIcon + ' ' + s.city + '</span>' +
						'<span class="tc-school-card__meta-row">' + bookIcon + ' <span><strong>Subjects:</strong> ' + s.subjects + '</span></span>' +
					'</div>' +
				'</div>' +
			'</a>';
	}

	function renderPage(page, isUserAction) {
		var grid = document.getElementById('schoolsGrid');
		if (!grid) { return; }

		// Cycle through the available sample groups so every page number is
		// clickable and shows a real set of cards, even beyond the 6 sample
		// records — this will be replaced by real query results per page
		// once connected to WordPress.
		var groupIndex = (page - 1) % TOTAL_GROUPS;
		var startIndex = groupIndex * PER_PAGE;
		var pageSchools = schools.slice(startIndex, startIndex + PER_PAGE);
		if (pageSchools.length === 0) {
			pageSchools = schools.slice(0, PER_PAGE);
		}

		grid.innerHTML = pageSchools.map(cardHtml).join('');
		currentPage = page;
		updatePaginationUI();

		// Only scroll when the user actively changes pages — never on the
		// initial page load. The page must open at the top (header,
		// breadcrumb, heading, vacancy banner all visible first).
		if (isUserAction) {
			grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	function updatePaginationUI() {
		var pagination = document.getElementById('schoolsPagination');
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
		var pagination = document.getElementById('schoolsPagination');
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
