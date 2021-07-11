"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show new story form when click submit */

function navSubmitClick(evt) {
  evt.preventDefault();
  console.debug("navSubmitClick", evt);
  navAllStories();
  $newStoryForm.show();
}

$body.on("click", "#nav-submit", navSubmitClick);

/** Show favorites list when click favorites */

function navFavoritesClick(evt) {
  evt.preventDefault();
  console.debug("navFavoritesClick", evt);
  putFavoritesListOnPage();
}

$body.on("click", "#nav-favorites", navFavoritesClick);

/** Show user list when click my stories */

function navMyStoriesClick(evt) {
  evt.preventDefault();
  console.debug("navMyStoriesClick", evt);
  putUserStoriesOnPage();
}

$body.on("click", "#nav-my-stories", navMyStoriesClick);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
