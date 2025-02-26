// YUKICHANGE: this file was added to mimic votes.js in src/posts... 
//             - defines when reaction (action) is in progress
//             - defines react action fucntion, hasReacted, toggleReact
'use strict';

const meta = require('../meta');
const db = require('../database');
const flags = require('../flags');
const user = require('../user');
const topics = require('../topics');
const plugins = require('../plugins');
const privileges = require('../privileges');
const translator = require('../translator');

module.exports = function (Posts) {
	const reactionsInProgress = {};

	Posts.react = async function (pid, uid) {
		if (meta.config['reputation:disabled']) {
			throw new Error('[[error:reputation-system-disabled]]');
		}

        // YUKICHANGE: commented out privileges related validations
		// const canUpvote = await privileges.posts.can('posts:react', pid, uid);
		// if (!canUpvote) {
		// 	throw new Error('[[error:no-privileges]]');
		// }

        // YUKICHANGE: not sure what this is doing, but gonna ignore the errors hash for now, if have time we can return
		if (reactInProgress(pid, uid)) {
			throw new Error('[[error:already-reacting-for-this-post]]');
		}
		putReactInProgress(pid, uid);

		try {
			return await toggleReact('react', pid, uid);
		} finally {
			clearReactProgress(pid, uid);
		}
	};

	// Posts.downvote = async function (pid, uid) {
	// 	if (meta.config['reputation:disabled']) {
	// 		throw new Error('[[error:reputation-system-disabled]]');
	// 	}

	// 	if (meta.config['downvote:disabled']) {
	// 		throw new Error('[[error:downvoting-disabled]]');
	// 	}
	// 	const canDownvote = await privileges.posts.can('posts:downvote', pid, uid);
	// 	if (!canDownvote) {
	// 		throw new Error('[[error:no-privileges]]');
	// 	}

	// 	if (voteInProgress(pid, uid)) {
	// 		throw new Error('[[error:already-voting-for-this-post]]');
	// 	}

	// 	putVoteInProgress(pid, uid);
	// 	try {
	// 		return await toggleVote('downvote', pid, uid);
	// 	} finally {
	// 		clearVoteProgress(pid, uid);
	// 	}
	// };

	Posts.unreact = async function (pid, uid) {
		// if (reactInProgress(pid, uid)) {
		// 	throw new Error('[[error:already-reacting-for-this-post]]');
		// }
		putReactInProgress(pid, uid);
		try {
			const reactStatus = await Posts.hasReacted(pid, uid);
			return await unreact(pid, uid, 'unreact', reactStatus);
		} finally {
			clearReactProgress(pid, uid);
		}
	};

	Posts.hasReacted = async function (pid, uid) {
		if (parseInt(uid, 10) <= 0) {
			return { reacted: false };
		}
		const hasReacted = await db.isMemberOfSets([`pid:${pid}:react`], uid);
		return { reacted: hasReacted[0]};
	};

	Posts.getReactionStatusByPostIDs = async function (pids, uid) {
		if (parseInt(uid, 10) <= 0) {
			const data = pids.map(() => false);
			// YUKICHECK: forgot which var i changed the upvotes to... reacts or reactions?? return { upvotes: data, downvotes: data };
            return { reactions: data }
		}
		const reactionSets = pids.map(pid => `pid:${pid}:react`);
		const data = await db.isMemberOfSets(reactionSets, uid);
		return {
			reactions: data.slice(0, pids.length),
        };
	};

	Posts.getReactedUidsByPids = async function (pids) {
		return await db.getSetsMembers(pids.map(pid => `pid:${pid}:react`));
	};

	function reactInProgress(pid, uid) {
		return Array.isArray(reactInProgress[uid]) && reactInProgress[uid].includes(parseInt(pid, 10));
	}

	function putReactInProgress(pid, uid) {
		reactionsInProgress[uid] = reactionsInProgress[uid] || [];
		reactionsInProgress[uid].push(parseInt(pid, 10));
	}

	function clearReactProgress(pid, uid) {
		if (Array.isArray(reactionsInProgress[uid])) {
			const index = reactionsInProgress[uid].indexOf(parseInt(pid, 10));
			if (index !== -1) {
				reactionsInProgress[uid].splice(index, 1);
			}
		}
	}

	async function toggleReact(type, pid, uid) {
		const reactStatus = await Posts.hasReacted(pid, uid);
		await unreact(pid, uid, type, reactStatus);
		return await react(type, false, pid, uid, reactStatus);
	}

	async function unreact(pid, uid, type, reactStatus) {
		const owner = await Posts.getPostField(pid, 'uid');
		if (parseInt(uid, 10) === parseInt(owner, 10)) {
			throw new Error('[[error:self-react]]');
		}

		// if (type === 'react') {
		// 	await checkReactLimitation(pid, uid, type);
		// }

		if (!reactStatus || (!reactStatus.reacted)) {
			return;
		}

		// return await react(reactStatus.reacted ? 'downvote' : 'upvote', true, pid, uid, reactStatus);
        return await react(reactStatus.reacted ? 'unreact' : 'react', true, pid, uid, reactStatus);
	}

	// async function checkReactLimitation(pid, uid, type) {
	// 	// type = 'react'
	// 	const oneDay = 86400000;
	// 	const [reputation, isPrivileged, targetUid, votedPidsToday] = await Promise.all([
	// 		user.getUserField(uid, 'reputation'),
	// 		user.isPrivileged(uid),
	// 		Posts.getPostField(pid, 'uid'),
	// 		db.getSortedSetRevRangeByScore(
	// 			`uid:${uid}:${type}`, 0, -1, '+inf', Date.now() - oneDay
	// 		),
	// 	]);
	// 	if (isPrivileged) {
	// 		return;
	// 	}
	// 	if (reputation < meta.config[`min:rep:${type}`]) {
	// 		throw new Error(`[[error:not-enough-reputation-to-${type}, ${meta.config[`min:rep:${type}`]}]]`);
	// 	}
	// 	const votesToday = meta.config[`${type}sPerDay`];
	// 	if (votesToday && votedPidsToday.length >= votesToday) {
	// 		throw new Error(`[[error:too-many-${type}s-today, ${votesToday}]]`);
	// 	}
	// 	const voterPerUserToday = meta.config[`${type}sPerUserPerDay`];
	// 	if (voterPerUserToday) {
	// 		const postData = await Posts.getPostsFields(votedPidsToday, ['uid']);
	// 		const targetUpVotes = postData.filter(p => p.uid === targetUid).length;
	// 		if (targetUpVotes >= voterPerUserToday) {
	// 			throw new Error(`[[error:too-many-${type}s-today-user, ${voterPerUserToday}]]`);
	// 		}
	// 	}
	// }

	async function react(type, unreact, pid, uid, reactStatus) {
		uid = parseInt(uid, 10);
		if (uid <= 0) {
			throw new Error('[[error:not-logged-in]]');
		}
		const now = Date.now();

		if (type === 'react' && !unreact) {
			await db.sortedSetAdd(`uid:${uid}:react`, now, pid);
		} else {
			await db.sortedSetRemove(`uid:${uid}:react`, pid);
		}

		// if (type === 'upvote' || unvote) {
		// 	await db.sortedSetRemove(`uid:${uid}:downvote`, pid);
		// } else {
		// 	await db.sortedSetAdd(`uid:${uid}:downvote`, now, pid);
		// }

		const postData = await Posts.getPostFields(pid, ['pid', 'uid', 'tid']);
		const newReputation = await user.incrementUserReputationBy(postData.uid, type === 'react' ? 1 : -1);

		await adjustPostReactions(postData, uid, type, unreact);

		await fireReactHook(postData, uid, type, unreact, reactStatus);

		return {
			user: {
				reputation: newReputation,
			},
			fromuid: uid,
			post: postData,
			react: type === 'react' && !unreact,
			// downvote: type === 'downvote' && !unvote,
		};
	}

	async function fireReactHook(postData, uid, type, unreact, reactStatus) {
		let hook = type;
		// YUKICHECK: This lowkey doens't make sense... do we want the 'unreact' here?? 
        // let current = reactStatus.reacted ? 'upvote' : 'downvote';
        let current = reactStatus.reacted ? 'unreact' : 'react';
		if (unreact) { // e.g. unreacting, removing a react
			hook = 'unreact';
		} else { // e.g. User *has not* reacted, clicks react
			current = 'unreact';
		}
		// action:post.upvote
		// action:post.downvote
		// action:post.unvote
		plugins.hooks.fire(`action:post.${hook}`, {
			pid: postData.pid,
			uid: uid,
			owner: postData.uid,
			current: current,
		});
	}

	async function adjustPostReactions(postData, uid, type, unreact) {
		const notType = (type === 'unreact' ? 'react' : 'react');
		if (unreact) {
			await db.setRemove(`pid:${postData.pid}:${type}`, uid);
		} else {
			await db.setAdd(`pid:${postData.pid}:${type}`, uid);
		}
		await db.setRemove(`pid:${postData.pid}:${notType}`, uid);

		const [reactions] = await Promise.all([
			db.setCount(`pid:${postData.pid}:reactions`),
			// db.setCount(`pid:${postData.pid}:downvote`),
		]);
		postData.reactions = reactions;
		// postData.downvotes = downvotes;
		// postData.reactions = postData.upvotes - postData.downvotes;
		await Posts.updatePostReactionCount(postData);
	}

	Posts.updatePostReactionCount = async function (postData) {
		if (!postData || !postData.pid || !postData.tid) {
			return;
		}
		// const threshold = meta.config['flags:autoFlagOnDownvoteThreshold'];
		// if (threshold && postData.reactions <= (-threshold)) {
		// 	const adminUid = await user.getFirstAdminUid();
		// 	const reportMsg = await translator.translate(`[[flags:auto-flagged, ${-postData.reactions}]]`);
		// 	const flagObj = await flags.create('post', postData.pid, adminUid, reportMsg, null, true);
		// 	await flags.notify(flagObj, adminUid, true);
		// }
		await Promise.all([
			updateTopicReactionCount(postData),
			db.sortedSetAdd('posts:reactions', postData.reactions, postData.pid),
			Posts.setPostFields(postData.pid, {
				reactions: postData.reactions,
				// downvotes: postData.downvotes,
			}),
		]);
		plugins.hooks.fire('action:post.updatePostReactionCount', { post: postData });
	};

	async function updateTopicReactionCount(postData) {
		const topicData = await topics.getTopicFields(postData.tid, ['mainPid', 'cid', 'pinned']);

		if (postData.uid) {
			if (postData.reactions !== 0) {
				await db.sortedSetAdd(`cid:${topicData.cid}:uid:${postData.uid}:pids:reactions`, postData.reactions, postData.pid);
			} else {
				await db.sortedSetRemove(`cid:${topicData.cid}:uid:${postData.uid}:pids:reactions`, postData.pid);
			}
		}

		if (parseInt(topicData.mainPid, 10) !== parseInt(postData.pid, 10)) {
			return await db.sortedSetAdd(`tid:${postData.tid}:posts:reactions`, postData.reactions, postData.pid);
		}
		const promises = [
			topics.setTopicFields(postData.tid, {
				reactions: postData.reactions,
			}),
			db.sortedSetAdd('topics:reactions', postData.reactions, postData.tid),
		];
		if (!topicData.pinned) {
			promises.push(db.sortedSetAdd(`cid:${topicData.cid}:tids:reactions`, postData.reactions, postData.tid));
		}
		await Promise.all(promises);
	}
};
