<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#08110c">
  <title>CampusCash — Clear funds. Stronger campus.</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="alternate icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main id="loginScreen" class="login-layout">
    <section class="login-brand">
      <a class="brand-lockup" href="#" aria-label="CampusCash home" id="brandLogo"><span class="brand-mark">C</span><span>Campus<span class="brand-highlight">Cash</span></span></a>
      <div class="brand-copy">
        <span class="eyebrow login-eyebrow"><span class="eyebrow-dot"></span> CAMPUS FINANCE, MADE CLEAR</span>
        <h1>Every peso.<br><span>Accounted for.</span></h1>
        <p>A shared, transparent space for student organizations to manage funds and keep members in the loop.</p>
        <div class="trust-row"><span class="trust-icon">✓</span> Built for student organizations <span class="trust-divider">·</span> Made for transparency</div>
      </div>
      <div class="brand-footer">CAMPUSCASH <span>© 2026</span></div>
      <div class="admin-shimmer-overlay"></div>
    </section>
    <section class="login-side">
      <form id="loginForm" class="login-card">
        <div class="login-heading">
          <span id="authEyebrow" class="eyebrow">WELCOME BACK</span>
          <h2 id="authTitle">Sign in to your account</h2>
          <p id="authDescription">Access your organization's financial workspace.</p>
          <div id="adminBadge" class="admin-badge" hidden>
            <span class="admin-lock-icon">🔒</span>
            <span>Administrator Access</span>
          </div>
        </div>
        <div id="registrationFields" class="registration-fields" hidden>
          <label class="input-label" for="registerName">Full name</label>
          <input id="registerName" name="fullName" autocomplete="name" placeholder="Enter your full name" minlength="2">
          <label class="input-label" for="registerEmail">Email address</label>
          <input id="registerEmail" name="email" type="email" autocomplete="email" placeholder="you@school.edu">
          <label class="input-label" for="registerOrganization">Organization</label>
          <input id="registerOrganization" name="organization" placeholder="Your student organization">
        </div>
        <label id="usernameLabel" class="input-label" for="loginUsername">Username</label>
        <input id="loginUsername" name="username" autocomplete="username" placeholder="Enter your username" required>
        <label id="passwordLabel" class="input-label" for="loginPassword">Password</label>
        <input id="loginPassword" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required>
        <div id="confirmPasswordField" hidden>
          <label class="input-label" for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" placeholder="Re-enter your password">
        </div>
        <p id="loginError" class="login-error" role="alert"></p>
        <button id="authSubmit" class="button button-primary login-submit" type="submit">Sign in <span aria-hidden="true">→</span></button>
        <p id="authSwitch" class="auth-switch">New to CampusCash? <button type="button" data-auth-mode="register">Create an account</button></p>
        <a id="memberLoginLink" class="member-login-link" href="#" hidden>← Back to member login</a>
      </form>
    </section>
  </main>

  <div id="app" class="app-shell" hidden>
    <aside class="sidebar">
      <a class="brand-lockup sidebar-brand" href="#" aria-label="CampusCash dashboard"><span class="brand-mark">C</span><span>Campus<span class="brand-highlight">Cash</span></span></a>
      <div class="org-switcher"><span class="org-avatar">BS</span><span class="org-text"><strong id="organizationName">CTU BSIT Society</strong><small id="organizationRole">Student workspace</small></span><span class="switcher-arrow">⌄</span></div>
      <div class="nav-label">WORKSPACE</div>
      <nav id="navigation" class="navigation" aria-label="Main navigation"></nav>
      <div class="sidebar-bottom">
        <div class="help-card"><span class="help-icon">?</span><strong>Need a hand?</strong><small>Learn how CampusCash works.</small><a href="#" id="helpLink">Visit help center <span>→</span></a></div>
        <button id="logoutButton" class="logout-button" type="button"><span class="logout-icon">↪</span> Sign out</button>
      </div>
    </aside>
    <section class="workspace">
      <header class="topbar">
        <div class="breadcrumbs"><span>CampusCash</span><span class="crumb-separator">/</span><strong id="currentBreadcrumb">Dashboard</strong></div>
        <div class="topbar-actions"><span class="secure-pill"><span></span> Secure workspace</span><button id="topProfile" class="profile-button" type="button"><span class="profile-initials">JD</span><span class="profile-name"><strong id="profileDisplayName">Juan Dela Cruz</strong><small id="profileRoleLabel">Student member</small></span><span class="switcher-arrow">⌄</span></button></div>
      </header>
      <main id="pageContent" class="page-content" tabindex="-1"></main>
      <footer class="workspace-footer"><span>CampusCash · Financial transparency for every organization.</span><span>DEMO ENVIRONMENT <i></i></span></footer>
    </section>
  </div>

  <div id="modalRoot"></div>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <script src="script.js"></script>
</body>
</html>
