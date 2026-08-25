/**
 * TeachingCareer — form submission handling for the HTML/CSS/JS stage.
 *
 * IMPORTANT: this is a frontend demo only. Form data is saved to
 * localStorage purely so the pages can be tested end-to-end (e.g. seeing
 * a success page after "submitting" the Candidate Registration form).
 * localStorage is NOT secure storage and nothing here should be treated
 * as production data — the real secure database + file upload workflow
 * is added when this frontend is converted into the WordPress theme.
 * Uploaded files are never read into localStorage; only the selected
 * filename is recorded, for display purposes.
 */
(function () {
	'use strict';

	function readForm( form ) {
		var data = {};
		var elements = form.elements;
		for ( var i = 0; i < elements.length; i++ ) {
			var el = elements[ i ];
			if ( ! el.name ) {
				continue;
			}
			if ( el.type === 'file' ) {
				data[ el.name ] = el.files && el.files[ 0 ] ? el.files[ 0 ].name : '';
				continue;
			}
			if ( el.type === 'checkbox' ) {
				if ( el.name.indexOf( '[]' ) !== -1 ) {
					if ( ! data[ el.name ] ) {
						data[ el.name ] = [];
					}
					if ( el.checked ) {
						data[ el.name ].push( el.value );
					}
				} else {
					data[ el.name ] = el.checked;
				}
				continue;
			}
			if ( el.type === 'radio' ) {
				if ( el.checked ) {
					data[ el.name ] = el.value;
				}
				continue;
			}
			data[ el.name ] = el.value;
		}
		return data;
	}

	function validateFile( input, maxBytes, allowedExts ) {
		if ( ! input.files || ! input.files[ 0 ] ) {
			return true; // optional / not selected
		}
		var file = input.files[ 0 ];
		var ext = file.name.split( '.' ).pop().toLowerCase();
		if ( allowedExts.indexOf( ext ) === -1 ) {
			alert( 'File type not allowed for "' + input.name + '". Allowed: ' + allowedExts.join( ', ' ) );
			return false;
		}
		if ( file.size > maxBytes ) {
			alert( 'File is too large for "' + input.name + '". Max size: ' + Math.round( maxBytes / 1024 / 1024 ) + 'MB.' );
			return false;
		}
		return true;
	}

	function saveDemoRecord( storageKey, record ) {
		var existing = [];
		try {
			existing = JSON.parse( localStorage.getItem( storageKey ) || '[]' );
		} catch ( e ) {
			existing = [];
		}
		record.submittedAt = new Date().toISOString();
		existing.push( record );
		localStorage.setItem( storageKey, JSON.stringify( existing ) );
	}

	document.addEventListener( 'DOMContentLoaded', function () {

		/* ---------------------------------------------------------------
		 * Candidate Registration
		 * ------------------------------------------------------------- */
		var candidateForm = document.getElementById( 'candidateForm' );
		if ( candidateForm ) {
			candidateForm.addEventListener( 'submit', function ( e ) {
				e.preventDefault();

				var teachWhereError = document.getElementById( 'teachWhereError' );
				var subjectsError = document.getElementById( 'subjectsError' );
				var teachWhereChecked = document.querySelectorAll( 'input[name="teach_where[]"]:checked' ).length > 0;
				var subjectsChecked = document.querySelectorAll( 'input[name="subjects[]"]:checked' ).length > 0;
				var valid = candidateForm.checkValidity();

				if ( ! teachWhereChecked ) {
					valid = false;
					if ( teachWhereError ) { teachWhereError.classList.add( 'tc-form-error--visible' ); }
				} else if ( teachWhereError ) {
					teachWhereError.classList.remove( 'tc-form-error--visible' );
				}

				if ( ! subjectsChecked ) {
					valid = false;
					if ( subjectsError ) { subjectsError.classList.add( 'tc-form-error--visible' ); }
				} else if ( subjectsError ) {
					subjectsError.classList.remove( 'tc-form-error--visible' );
				}

				var isFresher = document.getElementById( 'fresher-no' ) && document.getElementById( 'fresher-no' ).checked ? 'no' : 'yes';
				var expDoc = document.getElementById( 'c-exp-doc' );
				if ( 'no' === isFresher && expDoc && ( ! expDoc.files || ! expDoc.files[ 0 ] ) ) {
					valid = false;
					alert( 'Experience Letter / Proof of Experience is required since you selected "No" for Fresher.' );
				}

				if ( ! validateFile( document.getElementById( 'c-photo' ), 2 * 1024 * 1024, [ 'jpg', 'jpeg', 'png', 'webp' ] ) ) { valid = false; }
				if ( ! validateFile( document.getElementById( 'c-degree-doc' ), 5 * 1024 * 1024, [ 'pdf', 'jpg', 'jpeg', 'png' ] ) ) { valid = false; }
				if ( expDoc && ! validateFile( expDoc, 5 * 1024 * 1024, [ 'pdf', 'jpg', 'jpeg', 'png' ] ) ) { valid = false; }
				if ( ! validateFile( document.getElementById( 'c-police-doc' ), 5 * 1024 * 1024, [ 'pdf', 'jpg', 'jpeg', 'png' ] ) ) { valid = false; }

				if ( ! valid ) {
					candidateForm.reportValidity();
					return;
				}

				var data = readForm( candidateForm );
				var homeTuitionSelected = ( data[ 'teach_where[]' ] || [] ).indexOf( 'home_tuition' ) !== -1;
				data.homeTuitionEligibility = homeTuitionSelected ? 'Pending' : 'Not Requested';
				data.policeVerificationStatus = homeTuitionSelected ? 'Pending' : 'Not Required';
				data.applicationStatus = 'New';

				saveDemoRecord( 'tc_demo_candidate_applications', data );
				window.location.href = 'registration-success.html?type=candidate';
			} );
		}

		/* ---------------------------------------------------------------
		 * School Registration
		 * ------------------------------------------------------------- */
		var schoolForm = document.getElementById( 'schoolRegistrationForm' );
		if ( schoolForm ) {
			schoolForm.addEventListener( 'submit', function ( e ) {
				e.preventDefault();

				var valid = schoolForm.checkValidity();
				if ( ! validateFile( document.getElementById( 'school-logo' ), 2 * 1024 * 1024, [ 'jpg', 'jpeg', 'png' ] ) ) { valid = false; }

				if ( ! valid ) {
					schoolForm.reportValidity();
					return;
				}

				var data = readForm( schoolForm );
				data.registrationStatus = 'New';
				saveDemoRecord( 'tc_demo_school_registrations', data );
				window.location.href = 'registration-success.html?type=school';
			} );
		}

		/* ---------------------------------------------------------------
		 * Home Tutor / Parent Request
		 * ------------------------------------------------------------- */
		var homeTutorForm = document.getElementById( 'homeTutorForm' );
		if ( homeTutorForm ) {
			homeTutorForm.addEventListener( 'submit', function ( e ) {
				e.preventDefault();

				if ( ! homeTutorForm.checkValidity() ) {
					homeTutorForm.reportValidity();
					return;
				}

				var data = readForm( homeTutorForm );
				data.requestStatus = 'New';
				saveDemoRecord( 'tc_demo_home_tutor_requests', data );
				window.location.href = 'registration-success.html?type=home-tutor';
			} );
		}

		/* ---------------------------------------------------------------
		 * Contact page (separate from the footer Contact Us form and
		 * from the Home Tutor request form)
		 * ------------------------------------------------------------- */
		var contactPageForm = document.getElementById( 'contactPageForm' );
		if ( contactPageForm ) {
			contactPageForm.addEventListener( 'submit', function ( e ) {
				e.preventDefault();

				if ( ! contactPageForm.checkValidity() ) {
					contactPageForm.reportValidity();
					return;
				}

				var data = readForm( contactPageForm );
				saveDemoRecord( 'tc_demo_contact_messages', data );

				var existingNote = contactPageForm.querySelector( '.tc-form-contact-success' );
				if ( ! existingNote ) {
					var note = document.createElement( 'p' );
					note.className = 'tc-form-contact-success';
					note.style.cssText = 'color:var(--tc-teal-dark);font-weight:700;font-size:14px;text-align:center;margin-top:16px;';
					note.textContent = 'Thank you — your message has been received. We will get back to you soon.';
					contactPageForm.appendChild( note );
				}
				contactPageForm.reset();
			} );
		}

		/* ---------------------------------------------------------------
		 * Footer Contact Us form (present on every page)
		 * ------------------------------------------------------------- */
		var contactForms = document.querySelectorAll( '.tc-footer__form' );
		contactForms.forEach( function ( form ) {
			form.addEventListener( 'submit', function ( e ) {
				e.preventDefault();

				if ( ! form.checkValidity() ) {
					form.reportValidity();
					return;
				}

				var data = readForm( form );
				saveDemoRecord( 'tc_demo_contact_messages', data );

				var existingNote = form.parentElement.querySelector( '.tc-form-contact-success' );
				if ( ! existingNote ) {
					var note = document.createElement( 'p' );
					note.className = 'tc-form-contact-success';
					note.style.cssText = 'color:var(--tc-teal-dark);font-weight:700;font-size:13.5px;margin-top:12px;';
					note.textContent = 'Thank you — your message has been received. We will get back to you soon.';
					form.appendChild( note );
				}
				form.reset();
			} );
		} );

	} );
} )();
