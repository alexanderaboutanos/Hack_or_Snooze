"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const showStar = Boolean(currentUser);
  const hostName = Story.getHostName(story);
  return $(`
      <li id="${story.storyId}">
        ${showStar ? starHTML(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function starHTML(story) {
  function starType(story) {
    if (isFavoriteStory(currentUser, story.storyId) === true) {
      return "filled-star";
    }
    return "empty-star";
  }
  return `<span class="star">
            <i class="fav-star ${starType(story)}"></i>
          </span>`;
}

//determines if the star in the generateStoryMarkup should be empty or filled
function determineStarType(story) {
  // console.debug(
  //   "In function, determinesStar Type... this is the story: ",
  //   story
  // );
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** New Story Form Submission.
 * When users submit new story form
 */

async function newStoryFormSubmit() {
  console.debug("newStoryFormSubmit");

  // grab the author, title, and url
  let author = $("#author-input").val();
  let title = $("#title-input").val();
  let url = $("#url-input").val();

  // put newStory data into object
  let newStory = { author, title, url };

  // add newStory to API
  await StoryList.addStory(currentUser, newStory);

  // clear author, title, and url
  $("#author-input").val("");
  $("#title-input").val("");
  $("#url-input").val("");

  putStoriesOnPage();

  // hide story form
  $newStoryForm.hide();
}

$body.on("click", "#new-story-submit", newStoryFormSubmit);

/** FAVORITES LIST
 * hides everything on the page,
 * generates favorites list
 * show the favorites html list
 *
 */

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  //hides everything on the page
  hidePageComponents();

  // clear favorite list
  $favoriteStoriesList.empty();

  // loop through updated favorites list and generate HTML for all favorites
  // append them to DOM
  for (let favoriteStory of currentUser.favorites) {
    const $favoriteStory = generateStoryMarkup(favoriteStory);
    $favoriteStoriesList.append($favoriteStory);
  }

  $favoriteStoriesList.show();
}

/** My Stories list
 * hides everything on the page,
 * generates my stories list
 * show the my story html list
 *
 */

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  //hides everything on the page
  hidePageComponents();

  // clear favorite list
  $userStoriesList.empty();

  // pull user stories list from currentUser obj,
  // loop through all favorite stories and generate HTML for them
  // append them to DOM
  for (let ownStory of currentUser.ownStories) {
    const $ownStory = generateStoryMarkup(ownStory);
    $userStoriesList.append($ownStory);
  }

  // add garbage can symbol to all lis
  $("li").prepend(` <span class="garbage">
                      <i class="garbage-can"></i>
                    </span>`);

  $userStoriesList.show();
}
