<!-- This partial intentionally left blank; overwritten by nodebb-plugin-reactions -->
<div class="post-reactions d-flex gap-1 mt-2" component="post/reactions/container">
    {{#if posts.reactions.length}}
        {{#each posts.reactions}}
            <span class="reaction-bubble" data-reaction="{{this.reaction}}">
                {{this.emoji}} {{this.count}}
            </span>
        {{/each}}
    {{/if}}
</div>
