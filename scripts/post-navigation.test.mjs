import assert from "node:assert/strict";
import test from "node:test";
import {
    createPostNavigation,
    getActivePostNeighbors,
} from "../src/utils/post-navigation.ts";

const posts = [
    { slug: "latest", title: "Latest", category: "Examples", url: "/posts/latest/" },
    { slug: "guide", title: "Guide", category: "Guides", url: "/posts/guide/" },
    { slug: "middle", title: "Middle", category: "Examples", url: "/posts/middle/" },
    { slug: "older-guide", title: "Older guide", category: "Guides", url: "/posts/older-guide/" },
    { slug: "oldest", title: "Oldest", category: "Examples", url: "/posts/oldest/" },
];

test("ALL uses adjacent posts across categories", () => {
    const result = getActivePostNeighbors(createPostNavigation(posts, "middle"), "");
    assert.deepEqual(result, {
        newer: { title: "Guide", url: "/posts/guide/" },
        older: { title: "Older guide", url: "/posts/older-guide/" },
    });
});

test("category navigation skips other categories and carries its scope", () => {
    const result = getActivePostNeighbors(createPostNavigation(posts, "middle"), "?category=Examples");
    assert.deepEqual(result, {
        newer: { title: "Latest", url: "/posts/latest/?category=Examples" },
        older: { title: "Oldest", url: "/posts/oldest/?category=Examples" },
    });
    const nextUrl = new URL(result.older.url, "https://example.com");
    const next = getActivePostNeighbors(createPostNavigation(posts, "oldest"), nextUrl.search);
    assert.equal(next.newer.url, "/posts/middle/?category=Examples");
    assert.equal(next.older, null);
});

test("category boundaries and single-post categories have no outside links", () => {
    const latest = createPostNavigation(posts, "latest").categoryOnly;
    assert.equal(latest.newer, null);
    assert.equal(latest.older.url, "/posts/middle/?category=Examples");

    const single = { slug: "solo", title: "Solo", category: "Solo", url: "/posts/solo/" };
    const navigation = createPostNavigation([posts[0], single, posts[1]], "solo");
    assert.deepEqual(getActivePostNeighbors(navigation, "?category=Solo"), { newer: null, older: null });
    assert.equal(navigation.all.newer.url, "/posts/latest/");
    assert.equal(navigation.all.older.url, "/posts/guide/");
});

test("scope comes from the URL and does not leak into ALL or unrelated queries", () => {
    const navigation = createPostNavigation(posts, "middle");
    assert.equal(getActivePostNeighbors(navigation, "?category=Examples").older.url, "/posts/oldest/?category=Examples");
    for (const search of ["", "?tag=Examples", "?category=Guides", "?category=", "?category=Unknown"]) {
        assert.deepEqual(getActivePostNeighbors(navigation, search), navigation.all);
    }
});

test("Korean categories, reserved characters, base paths and nested slugs round-trip", () => {
    const category = "보안 / WEB & API+";
    const entries = [
        { slug: "web/latest", title: "최신 글", category, url: "/blog/posts/web/latest/" },
        { slug: "web/older", title: "이전 글", category, url: "/blog/posts/web/older/" },
    ];
    const navigation = createPostNavigation(entries, "web/latest");
    const result = getActivePostNeighbors(navigation, "?" + new URLSearchParams({ category }));
    const link = new URL(result.older.url, "https://example.com");
    assert.equal(link.pathname, "/blog/posts/web/older/");
    assert.equal(link.searchParams.get("category"), category);
});

test("unknown posts fail explicitly instead of linking to the first post", () => {
    assert.throws(() => createPostNavigation(posts, "missing"), /Post not found/);
});
