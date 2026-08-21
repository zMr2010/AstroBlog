# Music library folders

The page reads this directory as follows:

```text
public/music/<album-slug>/cover.jpg
public/music/<album-slug>/<song-slug>/1.mp3
public/music/<album-slug>/<song-slug>/2.mp3
public/music/<album-slug>/<song-slug>/lyrics.lrc
public/music/<album-slug>/<song-slug>/lyrics.txt
public/music/<album-slug>/<song-slug>/lyrics.meta.json
```

- Run `pnpm music:scaffold` after the catalog changes to create every album and song folder.
- Run `pnpm music:covers` to refresh the locally cached cover files from the Apple Music catalog IDs recorded in `src/data/jay-chou-music.json`.
- Number recordings from `1.mp3`. Additional takes use `2.mp3`, `3.mp3`, and so on.
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
