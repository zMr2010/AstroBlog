import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

type PostEntry = CollectionEntry<"posts">;
type BilingualLanguage = "en" | "cn";

type BilingualInfo = {
	baseName: string;
	canonicalSlug: string;
	language: BilingualLanguage;
};

type BilingualGroup = {
	baseName: string;
	canonicalSlug: string;
	en?: PostEntry;
	cn?: PostEntry;
};

export type BilingualPostPair = {
	slug: string;
	en: PostEntry;
	cn: PostEntry;
};

function normalizeContentPath(id: string) {
	return id.replace(/\\/g, "/");
}

function getCollectionRelativePath(entry: PostEntry) {
	const normalizedPath = normalizeContentPath(entry.filePath ?? entry.id);
	const postsRoot = "src/content/posts/";
	const postsRootIndex = normalizedPath.lastIndexOf(postsRoot);

	if (postsRootIndex < 0) return normalizedPath;

	return normalizedPath.slice(postsRootIndex + postsRoot.length);
}

function getBilingualInfo(entry: PostEntry): BilingualInfo {
	const entryPath = getCollectionRelativePath(entry);
	const parts = entryPath.split("/");
	const fileName = parts.at(-1) ?? "";
	const parentFolder = parts.at(-2) ?? "";
	const match = fileName.match(/^(.+)_(en|cn)(?:\.mdx?)?$/);

	if (!match) {
		throw new Error(
			`双语文章 "${entryPath}" 的文件名必须是 "x_en.md" 或 "x_cn.md"。`,
		);
	}

	const baseName = match[1];
	const language = match[2] as BilingualLanguage;

	if (parentFolder !== baseName) {
		throw new Error(
			`双语文章 "${entryPath}" 必须放在名为 "${baseName}" 的文件夹中。`,
		);
	}

	return {
		baseName,
		language,
		canonicalSlug: parts.slice(0, -1).join("/"),
	};
}

function markBilingualEntry(entry: PostEntry, info: BilingualInfo) {
	entry.slug = info.canonicalSlug;
	entry.data.biling = true;
	entry.data.bilingLang = info.language;
	entry.data.bilingGroup = info.baseName;
	entry.data.bilingCanonicalSlug = info.canonicalSlug;
	return entry;
}

function collectBilingualGroups(entries: PostEntry[]) {
	const groups = new Map<string, BilingualGroup>();

	for (const entry of entries) {
		if (!entry.data.biling) continue;

		const info = getBilingualInfo(entry);
		const group = groups.get(info.canonicalSlug) ?? {
			baseName: info.baseName,
			canonicalSlug: info.canonicalSlug,
		};

		if (group[info.language]) {
			throw new Error(
				`双语文章 "${info.canonicalSlug}" 存在重复的 ${info.language} 语言文件。`,
			);
		}

		group[info.language] = entry;
		groups.set(info.canonicalSlug, group);
	}

	for (const group of groups.values()) {
		if (!group.en || !group.cn) {
			throw new Error(
				`双语文章 "${group.canonicalSlug}" 需要同时存在 "${group.baseName}_en.md" 和 "${group.baseName}_cn.md"，且两个文件都需要设置 biling: true。`,
			);
		}
	}

	return groups;
}

function assertUniqueRenderedSlugs(entries: PostEntry[]) {
	const seen = new Map<string, string>();

	for (const entry of entries) {
		const existing = seen.get(entry.slug);
		if (existing) {
			throw new Error(
				`文章渲染路径冲突： "${existing}" 和 "${getCollectionRelativePath(entry)}" 都会渲染到 /posts/${entry.slug}/。`,
			);
		}
		seen.set(entry.slug, getCollectionRelativePath(entry));
	}
}

function applyBilingualRules(entries: PostEntry[]) {
	collectBilingualGroups(entries);

	const renderableEntries = entries
		.filter((entry) => {
			if (!entry.data.biling) return true;
			return getBilingualInfo(entry).language === "en";
		})
		.map((entry) => {
			if (!entry.data.biling) return entry;
			return markBilingualEntry(entry, getBilingualInfo(entry));
		});

	assertUniqueRenderedSlugs(renderableEntries);
	return renderableEntries;
}

function shouldIncludePost(data: PostEntry["data"]) {
	return import.meta.env.PROD ? data.draft !== true : true;
}

// Retrieve renderable posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }: PostEntry) =>
		shouldIncludePost(data),
	);
	const renderableBlogPosts = applyBilingualRules(allBlogPosts);

	const sorted = renderableBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getRawSortedPosts();

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getRawSortedPosts();
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

export async function getBilingualPostPair(
	entry: PostEntry,
): Promise<BilingualPostPair | null> {
	if (!entry.data.biling) return null;

	const info = getBilingualInfo(entry);
	const allBlogPosts = await getCollection("posts", ({ data }: PostEntry) =>
		shouldIncludePost(data),
	);
	const groups = collectBilingualGroups(allBlogPosts);
	const group = groups.get(info.canonicalSlug);

	if (!group?.en || !group.cn) return null;

	return {
		slug: info.canonicalSlug,
		en: markBilingualEntry(group.en, getBilingualInfo(group.en)),
		cn: markBilingualEntry(group.cn, getBilingualInfo(group.cn)),
	};
}
