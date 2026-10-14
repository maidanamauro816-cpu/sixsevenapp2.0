# SixSeven Security Specification

## 1. Data Invariants
1. A User document under `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`.
2. A Post document under `/posts/{postId}` can only have `authorId == request.auth.uid`. A user cannot impersonate another author.
3. Post deletion is only allowed if `resource.data.authorId == request.auth.uid`.
4. Updating a Post allows incrementing/updating counters (`likesCount`, `commentsCount`, `viewsCount`, `sharesCount`) or caption by author.
5. A Like under `/posts/{postId}/likes/{userId}` can only be written by the user whose UID matches `userId`.
6. A Comment under `/posts/{postId}/comments/{commentId}` must have `incoming().authorId == request.auth.uid`.
7. All strings are bounded in size to prevent resource exhaustion attacks.
8. Catch-all rule denies any unmatched path.

## 2. The Dirty Dozen Payloads
1. User profile creation with mismatched UID (`auth.uid != path.userId`) -> DENIED
2. Post creation with spoofed authorId (`incoming().authorId != auth.uid`) -> DENIED
3. Post deletion by a non-author -> DENIED
4. Like creation where `userId` does not match `auth.uid` -> DENIED
5. Comment creation with fake `authorId` -> DENIED
6. Post creation with oversized caption (> 300 chars) -> DENIED
7. Comment with oversized body (> 300 chars) -> DENIED
8. Anonymous write without authentication (`auth == null`) -> DENIED
9. Malicious path injection containing invalid chars -> DENIED
10. Attempt to overwrite another user's profile -> DENIED
11. Comment deletion by someone other than comment author or post author -> DENIED
12. Unauthenticated like/comment spam -> DENIED
