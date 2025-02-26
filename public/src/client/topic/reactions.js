// YUKICHANGE: added to mimic votes.js
'use strict';

define('forum/topic/reactions', [
	'components', 'translator', 'api', 'hooks', 'bootbox', 'alerts', 'bootstrap',
], function (components, translator, api, hooks, bootbox, alerts, bootstrap) {
	const Reactions = {};
	let _showTooltip = {};

	Reactions.addReactionHandler = function () {
		_showTooltip = {};
        components.get('topic').on('mouseenter', '[data-pid] [component="post/reaction-count"]', loadDataAndCreateTooltip);
        components.get('topic').on('mouseleave', '[data-pid] [component="post/reaction-count"]', destroyTooltip);
	};

	// function canSeeUpVotes() {
	// 	const { upvoteVisibility, privileges } = ajaxify.data;
	// 	return privileges.isAdminOrMod ||
	// 		upvoteVisibility === 'all' ||
	// 		(upvoteVisibility === 'loggedin' && config.loggedIn);
	// }

	// function canSeeVotes() {
	// 	const { upvoteVisibility, downvoteVisibility, privileges } = ajaxify.data;
	// 	return privileges.isAdminOrMod ||
	// 		upvoteVisibility === 'all' || downvoteVisibility === 'all' ||
	// 		((upvoteVisibility === 'loggedin' || downvoteVisibility === 'loggedin') && config.loggedIn);
	// }

	function destroyTooltip() {
		const $this = $(this);
		const pid = $this.parents('[data-pid]').attr('data-pid');
		const tooltip = bootstrap.Tooltip.getInstance(this);
		if (tooltip) {
			tooltip.dispose();
			$this.attr('title', '');
		}
		_showTooltip[pid] = false;
	}

	function loadDataAndCreateTooltip() {
		const $this = $(this);
		const el = $this.parent();
		const pid = el.parents('[data-pid]').attr('data-pid');
		_showTooltip[pid] = true;
		const tooltip = bootstrap.Tooltip.getInstance(this);
		if (tooltip) {
			tooltip.dispose();
			$this.attr('title', '');
		}

		api.get(`/posts/${pid}/reactors`, {}, function (err, data) {
			if (err) {
				return alerts.error(err);
			}
			if (_showTooltip[pid] && data) {
				createTooltip($this, data);
			}
		});
	}

	function createTooltip(el, data) {
		function doCreateTooltip(title) {
			el.attr('title', title);
			(new bootstrap.Tooltip(el, {
				container: '#content',
				html: true,
			})).show();
		}
		let usernames = data.usernames
			.filter(name => name !== '[[global:former-user]]');
		if (!usernames.length) {
			return;
		}
		if (usernames.length + data.otherCount > data.cutoff) {
			usernames = usernames.join(', ').replace(/,/g, '|');
			translator.translate('[[topic:users-and-others, ' + usernames + ', ' + data.otherCount + ']]', function (translated) {
				translated = translated.replace(/\|/g, ',');
				doCreateTooltip(translated);
			});
		} else {
			usernames = usernames.join(', ');
			doCreateTooltip(usernames);
		}
	}


	Reactions.toggleReact = function (button, className, delta) {
		const post = button.closest('[data-pid]');
		const currentState = post.find(className).length;

		const method = currentState ? 'del' : 'put';
		const pid = post.attr('data-pid');
		api[method](`/posts/${pid}/react`, {
			delta: delta,
		}, function (err) {
			if (err) {
				if (!app.user.uid) {
					ajaxify.go('login');
					return;
				}
				return alerts.error(err);
			}
			hooks.fire('action:post.toggleReact', {
				pid: pid,
				delta: delta,
				unreact: method === 'del',
			});
		});

		return false;
	};

	Reactions.showReactions = function (pid) {
		api.get(`/posts/${pid}/reactors`, {}, function (err, data) {
			if (err) {
				return alerts.error(err);
			}

			app.parseAndTranslate('modals/reactions', data, function (html) {
				const dialog = bootbox.dialog({
					title: '[[global:reactors]]',
					message: html,
					className: 'reactions-modal',
					show: true,
					onEscape: true,
					backdrop: true,
				});

				dialog.on('click', function () {
					dialog.modal('hide');
				});
			});
		});
	};


	return Reactions;
});
