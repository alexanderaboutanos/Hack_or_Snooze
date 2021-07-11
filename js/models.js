"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  static getHostName(story) {
    const newURL = new URL(story.url);
    const hostName = newURL.hostname;
    return hostName;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  static async addStory(currentUser, newStory) {
    // adds story data to API
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {
        token: currentUser.loginToken,
        story: {
          author: newStory.author,
          title: newStory.title,
          url: newStory.url,
        },
      },
    });

    console.log(response.data);

    // makes a Story instance
    const newStoryInst = new Story(response.data.story);

    // adds new story instance to story list.
    storyList.stories.unshift(newStoryInst);

    // adds new story instance to 'my stories' list.
    currentUser.ownStories.unshift(newStoryInst);

    //returns the new Story instance
    return newStoryInst;
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;
    console.debug("this is my tokenid: ", response.data.token);

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /**  toggle story as favorite
   */

  static async toggleStoryFavorite(currentUser, storyId) {
    console.debug("toggleStoryFavorite");

    // determine if we need to delete or add(post) this story as a favorite
    let determineMethod = function () {
      // isFavoriteStory(currentUser, storyId) === true ? "DELETE" : "POST";
      if (isFavoriteStory(currentUser, storyId) === true) {
        return "DELETE";
      } else {
        return "POST";
      }
    };
    console.log("determined method: ", determineMethod());

    // send the API request
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}/`,
      method: determineMethod(),
      params: { token: currentUser.loginToken },
    });

    // the respose gives an entirely updated list of favorites.
    const updatedFavoriteList = response.data.user.favorites;

    // update the currentUser's favorite list on the global window
    currentUser.favorites = updatedFavoriteList;
    return updatedFavoriteList;
  }

  /**  function to delete a story
   */

  static async deleteStory(currentUser, storyId) {
    console.debug("deleteStory");

    // send the API request
    const response = await axios({
      url: `${BASE_URL}/stories/${storyId}/`,
      method: "DELETE",
      params: { token: currentUser.loginToken },
    });
    console.log("it worked! you deleted: ", response);

    // update the currentUser's ownStories on the global window
    currentUser.ownStories = currentUser.ownStories.filter(function (val) {
      return val.storyId !== storyId;
    });

    // update the currentUser's favorite stories
    currentUser.favorites = currentUser.favorites.filter(function (val) {
      return val.storyId !== storyId;
    });

    // update the storyList on the global window
    storyList.stories = storyList.stories.filter(function (val) {
      return val.storyId !== storyId;
    });

    return response;
  }
}

function isFavoriteStory(currentUser, storyId) {
  for (let favoriteStory of currentUser.favorites) {
    if (favoriteStory.storyId === storyId) {
      return true;
    }
  }
  return false;
}
