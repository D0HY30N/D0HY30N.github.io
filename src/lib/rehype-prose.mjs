// Small rehype passes for post bodies. Kept dependency-free: the trees are walked by hand.

function walk(node, visit) {
  if (!node.children) return;
  node.children.forEach((child, index) => {
    visit(child, index, node);
    walk(child, visit);
  });
}

const isElement = (node, tagName) => node?.type === "element" && node.tagName === tagName;
const isBlank = node => node.type === "text" && !node.value.trim();

/** A paragraph holding only an image becomes a figure, with the alt text shown as its caption. */
export function rehypeImageFigures() {
  return tree => walk(tree, (node, index, parent) => {
    if (!isElement(node, "p")) return;
    const content = node.children.filter(child => !isBlank(child));
    if (content.length !== 1 || !isElement(content[0], "img")) return;
    const img = content[0];
    const alt = String(img.properties.alt ?? "").trim();
    const children = [img];
    // The img already carries the alt for screen readers, so the visible caption is not read twice.
    if (alt) children.push({ type: "element", tagName: "figcaption", properties: { ariaHidden: "true" }, children: [{ type: "text", value: alt }] });
    parent.children[index] = { type: "element", tagName: "figure", properties: {}, children };
  });
}

/** Glue each footnote's back arrow to the word before it so it never wraps onto a line alone. */
export function rehypeFootnoteBackrefs() {
  return tree => walk(tree, (node, index, parent) => {
    if (!isElement(node, "a") || node.properties.dataFootnoteBackref === undefined) return;
    const previous = parent.children[index - 1];
    if (previous?.type === "text") previous.value = previous.value.replace(/ $/, " ");
  });
}
