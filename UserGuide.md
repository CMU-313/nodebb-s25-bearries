# User Guide
New Features: 
- Instructors & Students roles and groups
- Question resolution status

## How to Use and User Testing
To user test, make sure that the following features work as described.
### Instructors & Students roles and groups
The "Instructors" and "Students" groups are created upon installation of the Team Bearries version of NodeBB. Users can be added through the groups dashboard by the admin as desired. When Instructors make posts, their status as instructional staff will be indicated with a badge next to their name. Toggling badges on in the profile menu may be needed for it to display properly. Furthermore, Instructors' posts will be automatically tagged with an `instructor-post` tag.

### Question resolution status
When a Student starts a new topic, this topic will automatically have the `unresolved` tag added in addition to any other selected tags upon posting of the topic. When the topic is replied to by an Instructor, this `unresolved` tag will be removed and a `resolved` tag will be added to the existing topic tags. Student replies will not affect the `unresolved` tag.

## Automated Tests
Automated tests can be found in `tests/topics.js` with the tests assessing topic tags. These tests check the following:
1. If the `unresolved` tag is added when a Student makes post.
2. If the `unresolved` tag is removed when an Instructor replies.
3. If a `resolved` tag is added when an Instructor replies.

These tests ensure that the main topic resolution feature is working as intended. 

## Testing integration: Taiko ## 
We integrated Taiko for our NodeBB forum application. Taiko stood out for its JavaScript-native approach and ease of use with Node.js applications.

## Execution Frequency
Taiko runs on pull requests and pushes to the main branch. We want to make sure new code passes our tests before merges. Running tests after merge gives us an additional safety check in case of conflict between PRs. 

## Configurations
Configurations added into test/automation/config.js: 
1) headless: true -> We must have this configuration since interactions with the fake browser Taiko generates is impossible when run in our CI/CD environment
2) slowMo: 0 -> This leads to quicker test feedback by getting rid of any extra delays
3) timeout: 30000 -> Nodebb operations can be slow so we account for this with a larger timeout than standard

## Enforcement
