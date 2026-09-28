/**
 * script.js — Portfolio by Jayvee C. Dela Rosa
 *
 * Sections:
 *  1. State
 *  2. Element References
 *  3. Section Navigation
 *  4. Theme Toggle
 *  5. Lightbox
 *  6. External Link Delegation
 *  7. Contact Form
 *  8. Notifications
 *  9. Username System
 * 10. Site Search
 * 11. Global Event Listeners (click-outside, keyboard)
 * 12. Init
 */


document.addEventListener('DOMContentLoaded', function () {


  /* ==========================================================
     1. STATE
     ========================================================== */
  let isLight    = localStorage.getItem('theme') === 'light';
  let notifOpen  = false;
  let notifRead  = false;
  let userDdOpen = false;


  /* ==========================================================
     2. ELEMENT REFERENCES
     ========================================================== */
  // Navigation
  const allSections   = document.querySelectorAll('.section');
  const allNavLinks   = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const statusSection = document.getElementById('status-section');


  const sectionNames = {
    about:        'About Me',
    projects:     'Projects',
    certificates: 'Certificates',
    education:    'Education',
    contact:      'Contact',
    architecture: 'System Architecture'
  };


  // Theme
  const themeToggleTop  = document.getElementById('theme-toggle');
  const themeToggleSide = document.getElementById('theme-toggle-sidebar');
  const themeIconTop    = document.getElementById('theme-icon');
  const themeLabelTop   = document.getElementById('theme-label');
  const themeIconSide   = document.getElementById('theme-icon-sidebar');
  const themeLabelSide  = document.getElementById('theme-label-sidebar');


  // Lightbox
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');


  // Notifications
  const notifBtn       = document.getElementById('notif-btn');
  const notifDropdown  = document.getElementById('notif-dropdown');
  const notifIndicator = document.getElementById('notif-indicator');


  // Username
  const usernameBtn     = document.getElementById('username-btn');
  const usernameDisplay = document.getElementById('username-display');
  const usernameDd      = document.getElementById('username-dropdown');
  const usernameInput   = document.getElementById('username-input');
  const usernameCancel  = document.getElementById('username-cancel');
  const usernameError   = document.getElementById('username-error');


  // Contact form
  const contactForm = document.getElementById('contact-form');
  const nameInput   = document.getElementById('c-name');
  const emailInput  = document.getElementById('c-email');
  const msgInput    = document.getElementById('c-message');
  const charCount   = document.getElementById('char-count');
  const btnSend     = document.getElementById('btn-send');
  const successBox  = document.getElementById('form-success');
  const honeypotInput = document.getElementById('c-website');


  /* ==========================================================
     3. SECTION NAVIGATION
     ========================================================== */
  function showSection(id) {
    allSections.forEach(function (s) {
      s.classList.toggle('active', s.id === id);
    });

    window.scrollTo(0, 0);

    allNavLinks.forEach(function (l) {
      l.classList.toggle('active', l.dataset.section === id);
    });


    if (statusSection) {
      statusSection.textContent = sectionNames[id] || id;
    }


    // Trigger reveal animations (delay capped to avoid slow stacking)
    const sec = document.getElementById(id);
    if (!sec) return;


    sec.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.remove('visible');
    });


    requestAnimationFrame(function () {
      sec.querySelectorAll('.reveal').forEach(function (el, i) {
        setTimeout(function () {
          // Guard: skip if the user already navigated away from this section
          if (sec.classList.contains('active')) {
            el.classList.add('visible');
          }
        }, Math.min(i * 30, 200));
      });
    });
  }


  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showSection(link.dataset.section);
    });
  });


  /* ==========================================================
     4. THEME TOGGLE
     ========================================================== */
  function applyTheme(light) {
    document.body.classList.toggle('light', light);
    // Icon and label represent the ACTION (what the user will switch TO)
    const iconClass = light ? 'fa-moon'       : 'fa-sun';
    const labelTop  = light ? 'Dark'           : 'Light';
    const labelSide = light ? 'Switch to Dark' : 'Switch to Light';


    themeIconTop.className     = 'fa ' + iconClass;
    themeLabelTop.textContent  = labelTop;
    themeIconSide.className    = 'fa ' + iconClass;
    themeLabelSide.textContent = labelSide;
  }


  function toggleTheme() {
    isLight = !isLight;
    applyTheme(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }


  themeToggleTop.addEventListener('click', toggleTheme);
  themeToggleSide.addEventListener('click', toggleTheme);


  /* ==========================================================
     5. LIGHTBOX
     ========================================================== */
  function openLightbox(src, altText) {
    const old = lightbox.querySelector('.lb-msg');
    if (old) old.remove();


    if (src === 'cert-placeholder') {
      lightboxImg.style.display = 'none';
      const msg = document.createElement('p');
      msg.className = 'lb-msg';
      msg.style.cssText = [
        'color:var(--text2)',
        'font-family:var(--mono)',
        'font-size:.85rem',
        'text-align:center',
        'padding:20px'
      ].join(';');
      msg.textContent = '[ Certificate image placeholder — add your image src here ]';
      lightbox.appendChild(msg);
    } else {
      lightboxImg.style.display = 'block';
      lightboxImg.src = src;
      lightboxImg.alt = altText || 'Certificate image';
    }


    lightbox.classList.add('open');
  }


  function closeLightbox() {
    lightbox.classList.remove('open');
  }


  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });


  window.openLightbox = openLightbox;


  /* ==========================================================
     6. EXTERNAL LINK DELEGATION
        Replaces all inline onclick="window.open(...)" with
        event delegation on the document.
     ========================================================== */

  // Project image wrappers — open project URL
  document.querySelectorAll('.project-img-wrap[data-url]').forEach(function (el) {
    el.addEventListener('click', function () {
      const url = el.dataset.url;
      if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });


  // All buttons with data-url (Website, Article, GitHub, Verify)
  document.querySelectorAll('.btn[data-url]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const url = btn.dataset.url;
      if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    });
  });


  // Certificate image wrappers — open lightbox with descriptive alt text
  document.querySelectorAll('.cert-img-wrap[data-cert]').forEach(function (el) {
    function getCertAlt() {
      const card   = el.closest('.cert-card');
      const nameEl = card ? card.querySelector('.cert-name') : null;
      return nameEl
        ? nameEl.textContent.trim()
        : (el.getAttribute('aria-label') || 'Certificate image');
    }

    el.addEventListener('click', function () {
      openLightbox(el.dataset.cert, getCertAlt());
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el.dataset.cert, getCertAlt());
      }
    });
  });


  // Certificate "Certificate" buttons — open lightbox
  document.querySelectorAll('.cert-btn--view[data-cert]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const card   = btn.closest('.cert-card');
      const nameEl = card ? card.querySelector('.cert-name') : null;
      const altText = nameEl ? nameEl.textContent.trim() : 'Certificate image';
      openLightbox(btn.dataset.cert, altText);
    });
  });


  /* ==========================================================
     7. CONTACT FORM
     ========================================================== */

  // ── Rate Limiting Configuration ────────────────────────────────────────────
  const SUBMIT_COOLDOWN_MS = 30000;
  const MAX_SUBMISSIONS    = 3;

  // ── Rate Limit State ───────────────────────────────────────────────────────
  let submissionCount = 0;
  let lastSubmitTime  = 0;
  let cooldownTimer   = null;

  // ── API Endpoint ───────────────────────────────────────────────────────────
  const API_ENDPOINT = 'https://roill6m399.execute-api.ap-southeast-1.amazonaws.com/contact';

  // ── Extra Element References ───────────────────────────────────────────────
  const rateLimitMsg = document.getElementById('rate-limit-msg');

  // ── Field Validation Rules ─────────────────────────────────────────────────
  const fieldRules = {
    'c-name': {
      errId:    'err-name',
      validate: function (val) { return val.length >= 2 && val.length <= 50; }
    },
    'c-email': {
      errId:    'err-email',
      validate: function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
    },
    'c-message': {
      errId:    'err-msg',
      validate: function (val) { return val.length >= 20 && val.length <= 2000; }
    }
  };

  // ── validateField ──────────────────────────────────────────────────────────
  function validateField(input) {
    const rule    = fieldRules[input.id];
    if (!rule) return true;
    const val     = input.value.trim();
    const errorEl = document.getElementById(rule.errId);
    if (rule.validate(val)) {
      input.classList.remove('error');
      if (errorEl) errorEl.classList.remove('show');
      return true;
    }
    input.classList.add('error');
    if (errorEl) errorEl.classList.add('show');
    return false;
  }

  // ── Helper: Show Rate Limit / Error Message ────────────────────────────────
  function showMessage(iconClass, text) {
    if (!rateLimitMsg) return;
    rateLimitMsg.innerHTML = '<i class="fa ' + iconClass + '" aria-hidden="true"></i> ' + text;
    rateLimitMsg.classList.add('show');
  }

  // ── Helper: Hide Rate Limit / Error Message ────────────────────────────────
  function hideMessage() {
    if (!rateLimitMsg) return;
    rateLimitMsg.classList.remove('show');
    rateLimitMsg.innerHTML = '';
  }

  // ── Helper: Reset the Send Button to its Default State ────────────────────
  function resetSendButton() {
    btnSend.disabled = false;
    btnSend.innerHTML = '<i class="fa fa-paper-plane" aria-hidden="true"></i> Send Message';
  }

  // ── Cooldown Countdown Timer ───────────────────────────────────────────────
  function startCooldownTimer() {
    if (cooldownTimer) clearInterval(cooldownTimer);

    cooldownTimer = setInterval(function () {
      const elapsed   = Date.now() - lastSubmitTime;
      const remaining = Math.ceil((SUBMIT_COOLDOWN_MS - elapsed) / 1000);

      if (remaining <= 0) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
        if (submissionCount < MAX_SUBMISSIONS) {
          resetSendButton();
          hideMessage();
        }
        return;
      }

      btnSend.disabled = true;
      btnSend.innerHTML = '<i class="fa fa-clock" aria-hidden="true"></i> Please wait ' + remaining + 's';
      showMessage('fa-clock', 'You can send another message in ' + remaining + ' seconds.');
    }, 1000);
  }

  // ── Character Counter ──────────────────────────────────────────────────────
  if (msgInput) {
    msgInput.addEventListener('input', function () {
      const length = msgInput.value.length;
      charCount.textContent = length + ' / 2000';
      charCount.classList.toggle('over', length > 2000);
    });
  }

  // ── Blur and Focus Validation ──────────────────────────────────────────────
  [nameInput, emailInput, msgInput].forEach(function (input) {
    if (!input) return;

    input.addEventListener('blur', function () {
      if (input.value.trim().length > 0) {
        validateField(input);
      }
    });

    input.addEventListener('focus', function () {
      input.classList.remove('error');
      const rule = fieldRules[input.id];
      if (rule) {
        const errorEl = document.getElementById(rule.errId);
        if (errorEl) errorEl.classList.remove('show');
      }
    });
  });

  // ── Form Submit Handler ────────────────────────────────────────────────────
  if (contactForm) {
    // Null guard — all required elements must be present before wiring submit
    if (!successBox || !btnSend || !charCount || !rateLimitMsg || !nameInput || !emailInput || !msgInput) {
      console.warn('Contact form: one or more required elements are missing. Form submission disabled.');
    } else {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        successBox.classList.remove('show');
        hideMessage();

        // Honeypot Check — if this hidden field has a value, a bot filled it
        // in. Silently pretend success without calling the API or revealing
        // the trap.
        if (honeypotInput && honeypotInput.value.trim() !== '') {
          contactForm.reset();
          charCount.textContent = '0 / 2000';
          charCount.classList.remove('over');
          successBox.classList.add('show');
          setTimeout(function () { successBox.classList.remove('show'); }, 6000);
          return;
        }

        // Rate Limit Check 1: Session Cap
        if (submissionCount >= MAX_SUBMISSIONS) {
          showMessage(
            'fa-ban',
            'You have reached the maximum of ' + MAX_SUBMISSIONS + ' messages per session. ' +
            'Please email me directly at jayveecalozadelarosa@gmail.com'
          );
          return;
        }

        // Rate Limit Check 2: Cooldown
        const now = Date.now();
        if (lastSubmitTime > 0 && (now - lastSubmitTime) < SUBMIT_COOLDOWN_MS) {
          startCooldownTimer();
          return;
        }

        // Field Validation
        const nameIsValid    = validateField(nameInput);
        const emailIsValid   = validateField(emailInput);
        const messageIsValid = validateField(msgInput);

        if (!nameIsValid || !emailIsValid || !messageIsValid) return;

        // All checks passed — disable button and send
        btnSend.disabled = true;
        btnSend.innerHTML = '<i class="fa fa-circle-notch fa-spin" aria-hidden="true"></i> Sending…';

        lastSubmitTime = Date.now();
        submissionCount++;

        fetch(API_ENDPOINT, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    nameInput.value.trim(),
            email:   emailInput.value.trim(),
            message: msgInput.value.trim()
          })
        })
        .then(function (response) {
          return response.json().then(function (data) {
            return { status: response.status, data: data };
          });
        })
        .then(function (result) {
          if (result.status === 200 && result.data.success === true) {
            // Success
            contactForm.reset();
            charCount.textContent = '0 / 2000';
            charCount.classList.remove('over');
            successBox.classList.add('show');
            setTimeout(function () { successBox.classList.remove('show'); }, 6000);

            if (submissionCount >= MAX_SUBMISSIONS) {
              btnSend.disabled = true;
              btnSend.innerHTML = '<i class="fa fa-ban" aria-hidden="true"></i> Message Limit Reached';
              showMessage(
                'fa-info-circle',
                'You have sent ' + MAX_SUBMISSIONS + ' messages this session. Thank you for reaching out!'
              );
            } else {
              startCooldownTimer();
            }
          } else {
            // Server-side error — do not count this as a submission
            submissionCount--;
            lastSubmitTime = 0;
            resetSendButton();
            const errorText = (result.data && result.data.error)
              ? result.data.error
              : 'Something went wrong. Please try again or email me directly.';
            showMessage('fa-exclamation-triangle', errorText);
          }
        })
        .catch(function (networkError) {
          // Network failure — undo submission count so the user can retry
          submissionCount--;
          lastSubmitTime = 0;
          resetSendButton();
          console.error('Contact form network error:', networkError);
          showMessage('fa-wifi', 'Network error. Please check your internet connection and try again.');
        });

      }); // end submit listener
    } // end null guard
  } // end if (contactForm)


  /* ==========================================================
     8. NOTIFICATIONS
     ========================================================== */
  function closeNotif() {
    notifOpen = false;
    notifDropdown.classList.remove('open');
    notifBtn.setAttribute('aria-expanded', 'false');
  }


  notifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    notifOpen = !notifOpen;
    notifDropdown.classList.toggle('open', notifOpen);
    notifBtn.setAttribute('aria-expanded', String(notifOpen));


    if (notifOpen && !notifRead) {
      notifRead = true;
      notifIndicator.classList.add('hidden');
    }
    if (userDdOpen) closeUsernameDd(false);
  });


  notifDropdown.addEventListener('click', function (e) { e.stopPropagation(); });


  /* ==========================================================
     9. USERNAME SYSTEM
     ========================================================== */
  const savedName = localStorage.getItem('portfolioUsername');
  if (savedName) usernameDisplay.textContent = savedName;


  function closeUsernameDd(save) {
    if (save) {
      const val = usernameInput.value.trim();
      if (val.length < 1 || val.length > 9) {
        usernameError.classList.add('show');
        return;
      }
      usernameError.classList.remove('show');
      usernameDisplay.textContent = val;
      localStorage.setItem('portfolioUsername', val);
    }
    userDdOpen = false;
    usernameDd.classList.remove('open');
    usernameError.classList.remove('show');
    usernameBtn.setAttribute('aria-expanded', 'false');
  }


  usernameBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (notifOpen) closeNotif();


    userDdOpen = !userDdOpen;
    usernameDd.classList.toggle('open', userDdOpen);
    usernameBtn.setAttribute('aria-expanded', String(userDdOpen));


    if (userDdOpen) {
      usernameInput.value = usernameDisplay.textContent;
      setTimeout(function () { usernameInput.focus(); }, 80);
    }
  });


  usernameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter')  { e.preventDefault(); closeUsernameDd(true); }
    if (e.key === 'Escape') { closeUsernameDd(false); }
  });


  usernameInput.addEventListener('input', function () {
    if (usernameInput.value.trim().length >= 1) {
      usernameError.classList.remove('show');
    }
  });


  usernameCancel.addEventListener('click', function (e) {
    e.stopPropagation();
    closeUsernameDd(false);
  });


  usernameDd.addEventListener('click', function (e) { e.stopPropagation(); });


  /* ==========================================================
     10. SITE SEARCH
        Ctrl+F-style search across every section. Picking a result
        switches to its section, scrolls to the match, and briefly
        highlights it on the page.
     ========================================================== */
  const searchWrap    = document.getElementById('site-search');
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchKbd     = document.getElementById('search-kbd');

  const SEARCH_MIN_CHARS   = 2;
  const SEARCH_MAX_RESULTS = 20;
  const SEARCH_SNIPPET_PAD = 40;
  const SEARCH_HIT_MS      = 3000;

  // Text inside these is hidden, status-only, or repeated elsewhere
  const SEARCH_SKIP = '.breadcrumb, .hp-field, .form-error, .rate-limit-msg, .form-success, .char-count';

  const sectionIcons = {
    about:        'fa-user',
    projects:     'fa-code',
    certificates: 'fa-certificate',
    education:    'fa-graduation-cap',
    contact:      'fa-envelope',
    architecture: 'fa-sitemap'
  };

  let searchMatches  = [];
  let searchActive   = -1;
  let searchHitTimer = null;

  if (/Mac|iPhone|iPad/.test(navigator.platform)) searchKbd.textContent = '[⌘K]';
  if (window.matchMedia('(max-width: 560px)').matches) searchInput.placeholder = 'Search portfolio';


  // One result per occurrence. Matches must start at a word boundary, so
  // "aws" skips "draws" but "cloud" still finds "CloudFront".
  function findMatches(query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp('(?<![\\p{L}\\p{N}])' + escaped, 'giu');
    const matches = [];

    allSections.forEach(function (sec) {
      const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.closest(SEARCH_SKIP)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let node;
      while ((node = walker.nextNode())) {
        for (const m of node.nodeValue.matchAll(pattern)) {
          matches.push({ section: sec.id, node: node, index: m.index, length: m[0].length });
        }
      }
    });

    return matches;
  }


  // Built with DOM nodes (not innerHTML) because the query is user input
  function buildSnippet(match) {
    const text   = match.node.nodeValue;
    const start  = Math.max(0, match.index - SEARCH_SNIPPET_PAD);
    const end    = Math.min(text.length, match.index + match.length + SEARCH_SNIPPET_PAD);
    const squash = function (s) { return s.replace(/\s+/g, ' '); };

    const before = (start > 0 ? '…' : '') + squash(text.slice(start, match.index)).trimStart();
    const after  = squash(text.slice(match.index + match.length, end)).trimEnd() + (end < text.length ? '…' : '');

    const mark = document.createElement('mark');
    mark.textContent = text.substr(match.index, match.length);

    const frag = document.createDocumentFragment();
    frag.append(before, mark, after);
    return frag;
  }


  function setSearchActive(i) {
    const items = searchResults.querySelectorAll('.search-result');
    if (!items.length) return;

    searchActive = (i + items.length) % items.length;
    items.forEach(function (item, n) {
      item.classList.toggle('active', n === searchActive);
      item.setAttribute('aria-selected', String(n === searchActive));
    });
    searchInput.setAttribute('aria-activedescendant', items[searchActive].id);
    items[searchActive].scrollIntoView({ block: 'nearest' });
  }


  function renderSearchResults(query) {
    searchResults.replaceChildren();
    searchActive = -1;
    searchInput.removeAttribute('aria-activedescendant');

    if (!searchMatches.length) {
      const empty = document.createElement('div');
      empty.className   = 'search-empty';
      empty.textContent = 'No results for "' + query + '"';
      searchResults.appendChild(empty);
      openSearch();
      return;
    }

    const shown  = searchMatches.slice(0, SEARCH_MAX_RESULTS);
    const header = document.createElement('div');
    header.className   = 'search-dd-header';
    header.textContent = shown.length < searchMatches.length
      ? 'Showing ' + shown.length + ' of ' + searchMatches.length + ' results'
      : searchMatches.length + ' result' + (searchMatches.length !== 1 ? 's' : '');
    searchResults.appendChild(header);

    shown.forEach(function (match, i) {
      const item = document.createElement('div');
      item.className = 'search-result';
      item.id        = 'search-result-' + i;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');

      const icon = document.createElement('div');
      icon.className = 'search-result__icon';
      icon.innerHTML = '<i class="fa ' + sectionIcons[match.section] + '" aria-hidden="true"></i>';

      const body    = document.createElement('div');
      const label   = document.createElement('div');
      const snippet = document.createElement('div');
      body.className      = 'search-result__body';
      label.className     = 'search-result__section';
      label.textContent   = sectionNames[match.section] || match.section;
      snippet.className   = 'search-result__snippet';
      snippet.appendChild(buildSnippet(match));
      body.append(label, snippet);

      item.append(icon, body);
      item.addEventListener('mousemove', function () {
        if (searchActive !== i) setSearchActive(i);
      });
      item.addEventListener('click', function () { goToMatch(i); });
      searchResults.appendChild(item);
    });

    openSearch();
  }


  function openSearch() {
    searchResults.classList.add('open');
    searchInput.setAttribute('aria-expanded', 'true');
  }


  function closeSearch() {
    searchResults.classList.remove('open');
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    searchActive = -1;
  }


  function clearSearchHit() {
    clearTimeout(searchHitTimer);
    document.querySelectorAll('mark.search-hit').forEach(function (mark) {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }


  function runSearch() {
    // Unwrap old highlights first so text nodes are whole again before searching
    clearSearchHit();
    const query = searchInput.value.trim();

    if (query.length < SEARCH_MIN_CHARS) {
      searchMatches = [];
      closeSearch();
      return;
    }

    searchMatches = findMatches(query);
    renderSearchResults(query);
  }


  function goToMatch(i) {
    const match = searchMatches[i];
    if (!match || !match.node.isConnected) return;

    closeSearch();
    searchInput.blur();

    if (!document.getElementById(match.section).classList.contains('active')) {
      showSection(match.section);
    }

    const range = document.createRange();
    range.setStart(match.node, match.index);
    range.setEnd(match.node, match.index + match.length);

    const mark = document.createElement('mark');
    mark.className = 'search-hit';
    range.surroundContents(mark);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mark.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    searchHitTimer = setTimeout(clearSearchHit, SEARCH_HIT_MS);
  }


  searchInput.addEventListener('input', runSearch);

  searchInput.addEventListener('focus', function () {
    if (notifOpen)  closeNotif();
    if (userDdOpen) closeUsernameDd(false);
    if (searchInput.value.trim().length >= SEARCH_MIN_CHARS) runSearch();
  });

  // Results keep focus in the input via mousedown below, so blur means "left search"
  searchInput.addEventListener('blur', closeSearch);
  searchResults.addEventListener('mousedown', function (e) { e.preventDefault(); });
  searchWrap.addEventListener('click', function (e) { e.stopPropagation(); });

  searchInput.addEventListener('keydown', function (e) {
    const isOpen = searchResults.classList.contains('open');

    if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      setSearchActive(searchActive + 1);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      setSearchActive(searchActive - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      goToMatch(searchActive >= 0 ? searchActive : 0);
    } else if (e.key === 'Escape') {
      if (searchInput.value) {
        searchInput.value = '';
        runSearch();
      } else {
        searchInput.blur();
      }
    }
  });


  /* ==========================================================
     11. GLOBAL EVENT LISTENERS
     ========================================================== */
  document.addEventListener('click', function () {
    if (notifOpen)  closeNotif();
    if (userDdOpen) closeUsernameDd(false);
  });


  document.addEventListener('keydown', function (e) {
    // Ctrl+K / Cmd+K — jump to the search bar
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (e.key === 'Escape') {
      closeLightbox();
      if (notifOpen)  closeNotif();
      if (userDdOpen) closeUsernameDd(false);
    }
  });


  /* ==========================================================
     12. INIT
     ========================================================== */

  // Dynamic item counts — reads actual DOM card count so the
  // number never goes stale when cards are added or removed.
  function updateItemCounts() {
    const projectCount = document.querySelectorAll('#projects .project-card').length;
    const certCount    = document.querySelectorAll('#certificates .cert-card').length;

    const projectsEl = document.getElementById('projects-count');
    const certsEl    = document.getElementById('certs-count');

    if (projectsEl) projectsEl.textContent = projectCount + ' item' + (projectCount !== 1 ? 's' : '');
    if (certsEl)    certsEl.textContent    = certCount    + ' credential' + (certCount !== 1 ? 's' : '');
  }


  applyTheme(isLight);
  showSection('about');
  updateItemCounts();


}); // end DOMContentLoaded
