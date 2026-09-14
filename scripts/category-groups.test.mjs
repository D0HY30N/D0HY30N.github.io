import assert from "node:assert/strict";
import test from "node:test";
import { groupCategories, normalizeCategoryGroups, resolveCategoryGroups } from "../src/utils/category-groups.ts";

const category = (name, count = 0) => ({ name, count, url: `/category/${encodeURIComponent(name)}/` });

test("configured group and child order preserves counts, links, and empty categories", () => {
    const web = category("WEB", 2);
    const network = category("네트워크");
    const astro = category("Astro", 1);
    assert.deepEqual(groupCategories([astro, network, web], [
        { name: "보안", categories: ["WEB", "네트워크"] },
        { name: "개발", categories: ["Astro"] },
    ]), [
        { name: "보안", categories: [web, network] },
        { name: "개발", categories: [astro] },
    ]);
});

test("categories without a parent appear before named groups without an invented parent", () => {
    const entries = [category("WEB", 2), category("Uncategorized", 1), category("__proto__", 1)];
    const result = groupCategories(entries, [{ name: "보안", categories: ["WEB"] }]);
    assert.deepEqual(result, [
        { name: "", categories: entries.slice(1) },
        { name: "보안", categories: entries.slice(0, 1) },
    ]);
    assert.equal(result.flatMap((group) => group.categories).length, entries.length);
});

test("a real 기타 parent does not absorb categories without a parent", () => {
    const entries = [category("메모"), category("새 분류", 1)];
    assert.deepEqual(groupCategories(entries, [{ name: "기타", categories: ["메모"] }]), [
        { name: "", categories: [entries[1]] },
        { name: "기타", categories: [entries[0]] },
    ]);
    assert.deepEqual(groupCategories(entries, []), [{ name: "", categories: entries }]);
});

test("surrounding whitespace is normalized without mutating configuration", () => {
    const configured = [{ name: " 보안 ", categories: [" WEB "] }];
    const expected = [{ name: "보안", categories: ["WEB"] }];
    assert.deepEqual(normalizeCategoryGroups(configured), expected);
    assert.equal(configured[0].name, " 보안 ");
    assert.equal(configured[0].categories[0], " WEB ");
    assert.equal(groupCategories([category("WEB")], configured)[0].categories[0].name, "WEB");
});

test("duplicate leaf names within or across groups are rejected after normalization", () => {
    assert.throws(() => normalizeCategoryGroups([
        { name: "보안", categories: ["WEB", " WEB "] },
    ]), /소분류.*중복/);
    assert.throws(() => normalizeCategoryGroups([
        { name: "보안", categories: ["WEB"] },
        { name: "개발", categories: [" WEB "] },
    ]), /소분류.*중복/);
});

test("blank labels and duplicate parent labels fail explicitly", () => {
    assert.throws(() => normalizeCategoryGroups([{ name: " ", categories: [] }]), /대분류/);
    assert.throws(() => normalizeCategoryGroups([{ name: "보안", categories: [" "] }]), /소분류/);
    assert.throws(() => normalizeCategoryGroups([
        { name: "보안", categories: ["WEB"] },
        { name: " 보안 ", categories: ["시스템"] },
    ]), /대분류.*중복/);
});

test("Markdown creates parent and child categories without configuration", () => {
    assert.deepEqual(resolveCategoryGroups([
        { parentCategory: " 공부 ", category: " 알고리즘 " },
        { parentCategory: "공부", category: "알고리즘" },
        { parentCategory: "공부", category: "자료구조" },
        { parentCategory: "프로젝트", category: "회고" },
    ], []), [
        { name: "공부", categories: ["알고리즘", "자료구조"] },
        { name: "프로젝트", categories: ["회고"] },
    ]);
});

test("Markdown extends existing groups while preserving order and empty categories", () => {
    const configured = [
        { name: "보안", categories: ["WEB", "네트워크"] },
        { name: "개발", categories: ["Astro"] },
    ];
    assert.deepEqual(resolveCategoryGroups([
        { parentCategory: "보안", category: "WEB" },
        { parentCategory: "보안", category: "암호학" },
        { category: "Astro" },
    ], configured), [
        { name: "보안", categories: ["WEB", "네트워크", "암호학"] },
        { name: "개발", categories: ["Astro"] },
    ]);
    assert.deepEqual(configured[0].categories, ["WEB", "네트워크"]);
});

test("an explicit Markdown parent overrides the legacy parent without duplicate counts", () => {
    const configured = [{ name: "기존", categories: ["WEB", "네트워크"] }];
    const groups = resolveCategoryGroups([
        { parentCategory: "보안", category: "WEB" },
        { category: "WEB" },
    ], configured);
    const result = groupCategories([category("WEB", 2), category("네트워크", 0)], groups);
    assert.deepEqual(result, [
        { name: "기존", categories: [category("네트워크", 0)] },
        { name: "보안", categories: [category("WEB", 2)] },
    ]);
    assert.equal(result.flatMap(group => group.categories).reduce((sum, item) => sum + item.count, 0), 2);
    assert.deepEqual(configured, [{ name: "기존", categories: ["WEB", "네트워크"] }]);
});

test("legacy parents remain while ungrouped Markdown categories have no parent", () => {
    const groups = resolveCategoryGroups([
        { category: "WEB" },
        { category: "새 분류", parentCategory: " " },
        { category: null, parentCategory: null },
    ], [{ name: "보안", categories: ["WEB"] }]);
    assert.deepEqual(groupCategories([category("WEB", 1), category("새 분류", 1)], groups), [
        { name: "", categories: [category("새 분류", 1)] },
        { name: "보안", categories: [category("WEB", 1)] },
    ]);
});

test("a Blog folder without a parent stays standalone with its count and link", () => {
    const groups = resolveCategoryGroups([{ category: "Blog", parentCategory: "" }], []);
    assert.deepEqual(groupCategories([category("Blog", 1)], groups), [
        { name: "", categories: [category("Blog", 1)] },
    ]);
});

test("conflicting Markdown parents fail instead of silently mixing categories", () => {
    assert.throws(() => resolveCategoryGroups([
        { parentCategory: "보안", category: "WEB" },
        { parentCategory: "개발", category: " WEB " },
    ], []), /WEB.*보안.*개발.*parentCategory/);
});

test("a parent requires a child and moving the last child removes an empty heading", () => {
    assert.throws(() => resolveCategoryGroups([{ parentCategory: "보안", category: " " }], []), /소분류/);
    assert.deepEqual(resolveCategoryGroups([
        { parentCategory: "새 대분류", category: "WEB" },
    ], [{ name: "이전 대분류", categories: ["WEB"] }]), [
        { name: "새 대분류", categories: ["WEB"] },
    ]);
});
