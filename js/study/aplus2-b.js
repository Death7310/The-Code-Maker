/* study/aplus2-b.js — in-depth notes: A+ Core 2 lessons c5–c9. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    c5: {
      sections: [
        { h: 'The principle: independent factors fail independently', html: `
<p>Authentication proves identity using <strong>factors</strong>: something you <em>know</em> (password, PIN), something you <em>have</em> (phone, security key, smart card) and something you <em>are</em> (fingerprint, face). MFA is powerful because an attacker must defeat <em>different kinds</em> of protection at once: stealing a password over the internet doesn't give them your physical key. Two items of the same kind (password + security question) are still a single factor.</p>` },
        { h: 'Strength of common second factors', html: `
<pre>SMS codes                 better than nothing; vulnerable to SIM swapping and interception
Authenticator app (TOTP)  good; codes can still be phished in real time
Push approval             convenient; vulnerable to "push fatigue" (spamming approvals)
Number matching push      resists push fatigue
FIDO2 / passkeys / keys   phishing-resistant: bound to the real website's domain</pre>` },
        { h: 'Modern password guidance (NIST SP 800-63B)', html: `
<ul>
  <li>Favor <strong>length</strong> (long passphrases) over forced complexity rules.</li>
  <li><strong>Check new passwords against lists of breached and common passwords.</strong></li>
  <li>Don't force periodic changes without a reason; change them when there's evidence of compromise.</li>
  <li>Allow paste, so password managers work. Password managers make unique passwords for every site practical.</li>
</ul>
<p>Related ideas: <strong>SSO</strong> (one login for many apps, which raises the stakes on that one login, so protect it with strong MFA), and <strong>account lockout or throttling</strong> to slow guessing.</p>` },
      ],
      misconceptions: ['Password + PIN is MFA. (Both are "know" factors.)', 'Forced 90-day password changes improve security. (NIST advises against changes without cause; they push people toward predictable patterns.)'],
      examTraps: ['Identify the factor TYPE of each item in a scenario.', 'Biometrics are "something you are"; a smart card is "something you have".'],
      onTheJob: 'Identity teams roll out MFA and passkeys. Incident responders frequently trace breaches to accounts without MFA, or to push-fatigue approvals.',
      checks: [
        { q: 'Which combination is genuine multi-factor authentication?', options: ['Password + mother\'s maiden name', 'PIN + password', 'Fingerprint + a code from a hardware token', 'Two different passwords'], answer: 2, why: ['Both are "know".', 'Both are "know".', '"Are" plus "have": two different factor types.', 'Both are "know".'] },
        { q: 'Attackers keep sending login approval prompts to a user\'s phone, hoping they tap Approve. Which change most directly counters this?', options: ['Longer passwords', 'Number matching or phishing-resistant FIDO2 authentication', 'More frequent password changes', 'Hiding the login page'], answer: 1, why: ['The attacker already has the password.', 'Number matching requires information shown on the real login screen; FIDO2 removes approval prompts entirely.', 'The password isn\'t the weak point here.', 'Obscurity doesn\'t stop push spam.'] },
      ],
      sources: [
        { title: 'NIST SP 800-63B: Digital Identity Guidelines', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html' },
        { title: 'CISA: Implementing phishing-resistant MFA', url: 'https://www.cisa.gov/' },
      ],
    },

  });
})(typeof window !== 'undefined' ? window : globalThis);
