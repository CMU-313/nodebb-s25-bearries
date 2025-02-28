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