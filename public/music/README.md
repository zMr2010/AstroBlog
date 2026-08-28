# Music library folders

The page reads this directory as follows:

```text
public/music/<album-slug>/cover.jpg
public/music/<album-slug>/<song-slug>/<song-title>_<singing-style>_<YYYYMMDD>.m4a
public/music/<album-slug>/<song-slug>/lyrics.lrc
public/music/<album-slug>/<song-slug>/lyrics.txt
public/music/<album-slug>/<song-slug>/lyrics.meta.json
```

- Run `pnpm music:scaffold` after the catalog changes to create every album and song folder.
- Run `pnpm music:covers` to refresh the locally cached cover files from the Apple Music catalog IDs recorded in `src/data/jay-chou-music.json`.
- Name recordings as `<song-title>_<singing-style>_<date>.m4a`, for example `发如雪_清唱_20260827.m4a`.
- Both `.m4a` and `.mp3` recordings are scanned. The full file name is shown on the page.
- The date must be the final part before the extension. Supported forms include `YYYYMMDD`, `YYYY-MM-DD`, `YYYY.MM.DD`, `YYYY_MM_DD`, and `YYYY年MM月DD日`.
- Recordings with a valid date are ordered from oldest to newest. Files without a recognized date appear afterwards, ordered by file name.
- The page accepts either `lyrics.lrc` or `lyrics.txt`, preferring LRC when both exist.
- Rebuild the site after adding recordings so album progress and version lists update.
- Only publish lyrics, covers, and recordings you are authorized to use.

## Rights and lyric metadata

- Neither script downloads lyrics. Lyrics must be imported manually after you have permission to reproduce and publish them.
- A lyric file being publicly reachable does not itself grant copying or public-communication rights.
- `music:covers` caches artwork returned by the Apple Music catalog for local preview. API access is not a general republication license; confirm the intended public use or replace each file with artwork you are authorized to publish.
- Source links identify where metadata or artwork came from. They do not imply that copyright belongs to this site.

When a lyric is imported, add `lyrics.meta.json` beside it so the page can retain attribution and avoid presenting an unchecked fragment as a verified complete lyric:

```json
{
	"complete": true,
	"rightsStatus": "authorized",
	"sourceUrl": "https://licensed-provider.example/song",
	"attribution": "Lyrics displayed under license from …",
	"copyrightNotice": "Copyright notice required by the provider"
}
```

If this file is absent or `complete` is not `true`, the page labels the lyric as needing a completeness check.
