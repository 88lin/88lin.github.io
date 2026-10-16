#!/usr/bin/env python3
"""
微信公众号草稿上传脚本

功能：刷新 token → 压缩 HTML → 上传封面 → 创建草稿，全自动一站式。

依赖：pip install requests Pillow

配置（按优先级）:
  1. 环境变量（推荐）：WECHAT_TOKEN_FILE, WECHAT_CONFIG_FILE, WECHAT_COVER_PATH
  2. 配置文件：~/.wechat_config.json（格式见下方）
  3. 默认路径：~/.wechat_access_token, ~/.wechat_config.json, ./image_001.jpg

配置文件格式（~/.wechat_config.json）:
  {
    "WECHAT_APP_ID": "wx_your_appid",
    "WECHAT_APP_SECRET": "your_app_secret"
  }

命令行用法:
  python3 wechat_draft.py                  # 交互式
  python3 wechat_draft.py cover.jpg "标题" "摘要" "正文html"
  python3 wechat_draft.py cover.jpg "标题" "摘要" < article.html

Python 用法（推荐）:
  import sys; sys.path.insert(0, 'scripts')
  from wechat_draft import upload_and_cleanup
  media_id, nbsp = upload_and_cleanup(
      cover_path='image_001.jpg',
      title='文章标题',
      digest='摘要',
      html_content=open('article.html', encoding='utf-8').read()
  )
"""

import sys, os, json, re, datetime
import argparse
import mimetypes
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

# 压缩逻辑只此一份（scripts/minify_gzh_html.py），不在这里复制实现——
# 两份拷贝必然漂移，之前就是这么把"换行被吃掉"的 bug 复制了两遍。
if __package__:
    from .cli_utils import configure_stdio, print_status
    from .minify_gzh_html import minify_html
else:
    from cli_utils import configure_stdio, print_status
    from minify_gzh_html import minify_html

# ── 配置路径（可通过环境变量覆盖）───────────────────────────────────────
# Token 缓存文件
TOKEN_FILE = os.environ.get(
    'WECHAT_TOKEN_FILE',
    os.path.expanduser('~/.wechat_access_token')
)
# 微信公众号配置文件（含 appid / secret）
CONFIG_FILE = os.environ.get(
    'WECHAT_CONFIG_FILE',
    os.path.expanduser('~/.wechat_config.json')
)


# ── Token 管理 ─────────────────────────────────────────────────────────

def _parse_json(r):
    """统一按 UTF-8 显式解码。

    部分微信接口按 ISO-8859-1 声明编码，r.json() 会双重解码造成中文乱码——
    SKILL.md 第 6 步明确要求用 json.loads(r.content.decode('utf-8'))。
    以前只有 draft/get 遵守了，其余三个接口仍在用 r.json()。
    """
    return json.loads(r.content.decode('utf-8'))


def _load_config():
    """在数据入口校验凭据，让配置错误走 CLI 的 ValueError 提示。"""
    with open(CONFIG_FILE, encoding='utf-8') as f:
        cfg = json.load(f)
    if not isinstance(cfg, dict):
        raise ValueError('公众号配置必须是 JSON 对象')
    for key in ('WECHAT_APP_ID', 'WECHAT_APP_SECRET'):
        value = cfg.get(key)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f'公众号配置项 {key} 必须是非空字符串')
    return cfg


def _cached_token(appid):
    """返回当前 AppID 仍有效的缓存 token；损坏或格式不对的缓存一律视为未命中。"""
    try:
        with open(TOKEN_FILE, encoding='utf-8') as f:
            data = json.load(f)
        expires = datetime.datetime.fromisoformat(data['expires'])
        if (data.get('appid') == appid and isinstance(data['access_token'], str)
                and datetime.datetime.now() < expires - datetime.timedelta(minutes=5)):
            return data['access_token']
    except (OSError, ValueError, TypeError, KeyError, AttributeError):
        pass
    return None


def get_token():
    """只复用当前 AppID 的有效缓存；旧格式、损坏或其他账号的缓存必须刷新。"""
    appid = _load_config()['WECHAT_APP_ID']
    return _cached_token(appid) or refresh_token()


def refresh_token():
    """调用 stable_token 接口刷新 access_token，并缓存到本地文件。"""
    cfg = _load_config()
    import requests
    appid = cfg['WECHAT_APP_ID']
    secret = cfg['WECHAT_APP_SECRET']

    url = "https://api.weixin.qq.com/cgi-bin/stable_token"
    r = requests.post(url, json={
        'grant_type': 'client_credential',
        'appid': appid,
        'secret': secret,
        'force_refresh': False
    }, timeout=10)
    result = _parse_json(r)
    if 'access_token' not in result:
        raise RuntimeError(f"Token 刷新失败: {result}")

    token = result['access_token']
    expires = datetime.datetime.now() + datetime.timedelta(seconds=result.get('expires_in', 7200))
    with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
        json.dump({'appid': appid, 'access_token': token, 'expires': expires.isoformat()}, f)
    return token


# ── 封面图上传 ─────────────────────────────────────────────────────────

def upload_cover(token, img_path):
    """
    压缩封面上传，返回 media_id（必须用 type=thumb）。
    压缩到 ≤64KB（微信限制），质量自适应。
    """
    from PIL import Image, ImageOps
    import requests as _req

    # Bake the camera orientation into the pixels before JPEG drops EXIF.
    with Image.open(img_path) as source:
        img = ImageOps.exif_transpose(source).convert('RGB')
    out = img_path.rsplit('.', 1)[0] + '_thumb.jpg'
    quality, size = 85, float('inf')
    while size > 64000 and quality > 30:
        img.save(out, 'JPEG', quality=quality)
        size = os.path.getsize(out)
        quality -= 5

    # 只降质量可能压不到 64KB（大尺寸照片 quality=30 仍超限，会被微信拒收）。
    # 质量降到最低还不够时，按比例缩尺寸再压，最多缩 4 轮。
    attempts = 0
    while size > 64000 and attempts < 4:
        attempts += 1
        w, h = img.size
        img = img.resize((max(1, int(w * 0.7)), max(1, int(h * 0.7))),
                         Image.LANCZOS)
        quality = 85
        while size > 64000 and quality > 30:
            img.save(out, 'JPEG', quality=quality)
            size = os.path.getsize(out)
            quality -= 5

    if size > 64000:
        raise RuntimeError(f"封面压缩后仍为 {size} 字节（>64KB），"
                        "请换一张更小的图或先自行裁剪")

    with open(out, 'rb') as f:
        files = {'media': ('cover.jpg', f, 'image/jpeg')}
        # access_token / type 必须放 URL query 参数（微信接口从 query 读取，
        # 放 multipart form data 里会报 40001 invalid credential）
        r = _req.post(
            "https://api.weixin.qq.com/cgi-bin/material/add_material",
            params={'access_token': token, 'type': 'thumb'},
            files=files, timeout=15
        )
    result = _parse_json(r)
    if 'media_id' not in result:
        raise RuntimeError(f"封面上传失败: {result}")
    return result['media_id']


# ── 草稿操作 ───────────────────────────────────────────────────────────

def create_draft(token, thumb_media_id, title, digest, content):
    """调用 draft/add 创建草稿，返回 media_id。"""
    import requests as _req
    draft_data = {
        "articles": [{
            "title": title,
            "digest": digest,
            "content": content,
            "content_source_url": "",
            "thumb_media_id": thumb_media_id,
            "need_open_comment": 1,
            "only_fans_can_comment": 0
        }]
    }
    url = f"https://api.weixin.qq.com/cgi-bin/draft/add?access_token={token}"
    body = json.dumps(draft_data, ensure_ascii=False)
    r = _req.post(
        url,
        data=body.encode('utf-8'),
        headers={'Content-Type': 'application/json; charset=utf-8'},
        timeout=15
    )
    result = _parse_json(r)
    if 'media_id' not in result:
        raise RuntimeError(f"草稿创建失败: {result}")
    return result['media_id']


def update_draft(token, media_id, thumb_media_id, title, digest, content, *, original_article=None):
    """调用 draft/update 更新已有草稿。"""
    import requests as _req
    original = original_article if original_article is not None else _get_article(token, media_id)
    # Copy only editable fields, not read-only response fields such as url/update_time.
    editable = {'title', 'author', 'digest', 'content', 'content_source_url',
                'thumb_media_id', 'need_open_comment', 'only_fans_can_comment',
                'show_cover_pic'}
    article = {key: value for key, value in original.items() if key in editable}
    article.update(title=title, digest=digest, content=content, thumb_media_id=thumb_media_id)
    update_data = {
        "media_id": media_id,
        "index": 0,
        "articles": article
    }
    url = f"https://api.weixin.qq.com/cgi-bin/draft/update?access_token={token}"
    body = json.dumps(update_data, ensure_ascii=False)
    r = _req.post(
        url,
        data=body.encode('utf-8'),
        headers={'Content-Type': 'application/json; charset=utf-8'},
        timeout=15
    )
    result = _parse_json(r)
    if result.get('errcode') != 0:
        raise RuntimeError(f"草稿更新失败: {result}")
    return media_id


# ── 一站式上传 ─────────────────────────────────────────────────────────

class DraftVerificationError(RuntimeError):
    """The draft exists; retry verification with media_id, not draft creation."""

    def __init__(self, media_id, reason):
        self.media_id = media_id
        super().__init__(f'草稿已创建（media_id={media_id}），但验证失败：{reason}；请回读验证，不要重复创建')


def _get_article(token, media_id):
    import requests
    r = requests.post(
        f'https://api.weixin.qq.com/cgi-bin/draft/get?access_token={token}',
        json={'media_id': media_id}, timeout=10)
    result = _parse_json(r)
    news = result.get('news_item')
    if not isinstance(news, list) or not news or not isinstance(news[0], dict):
        raise RuntimeError(f'取回草稿失败: {result}')
    if not isinstance(news[0].get('content'), str):
        raise RuntimeError('取回草稿缺少正文')
    return news[0]


def _nbsp_count(content):
    return len(re.findall(r'&nbsp;|&#0*160;|&#x0*a0;|\u00a0', content, re.I))


NBSP_RUN = re.compile(r'(?:&nbsp;|&#0*160;|&#x0*a0;|\u00a0){2,}', re.I)


def verify_draft(token, media_id, expected_title, *, expected_nbsp=None):
    try:
        news = _get_article(token, media_id)
        if news.get('title') != expected_title:
            raise RuntimeError('回读标题与提交标题不一致（含中文/emoji）')
        count = _nbsp_count(news['content'])
        if expected_nbsp is not None and (count != expected_nbsp or NBSP_RUN.search(news['content'])):
            raise RuntimeError('回读正文的空白清理结果不符（仍有连串 nbsp 或单个间距数量改变）')
        return count
    except Exception as exc:
        raise DraftVerificationError(media_id, str(exc)) from exc


class _Images(HTMLParser):
    """Locate only actual img src attributes, leaving the rest of HTML intact."""

    def __init__(self, html, base_dir):
        super().__init__(convert_charrefs=False)
        self.base_dir = Path(base_dir or Path.cwd()).resolve()
        self.images = []
        # HTMLParser advances rows only at LF, not at every str.splitlines separator.
        self.offsets = [0] + [match.end() for match in re.finditer('\n', html)]
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        if tag != 'img':
            return
        src = dict(attrs).get('src', '') or ''
        parsed = urlsplit(src)
        if parsed.scheme.lower() in {'http', 'https'} and parsed.netloc:
            return
        # Drive letters are paths, not URL schemes. Unsupported schemes must not leak into drafts.
        if parsed.scheme and parsed.scheme != 'file' and not re.match(r'^[A-Za-z]:[\\/]', src):
            raise ValueError(f'正文图片不支持此来源：{src[:80]}')
        if not src or src.startswith('//'):
            raise ValueError('正文图片缺少明确的本地路径或 http(s) URL')
        path_text = unquote(src) if re.match(r'^[A-Za-z]:[\\/]', src) else unquote(parsed.path)
        if re.match(r'^/[A-Za-z]:/', path_text):
            path_text = path_text[1:]
        if parsed.scheme == 'file' and parsed.netloc not in {'', 'localhost'}:
            raise ValueError('正文图片不支持远程 file 主机')
        path = Path(path_text)
        path = path.resolve() if path.is_absolute() else (self.base_dir / path).resolve()
        if not path.is_file():
            raise FileNotFoundError(f'找不到正文图片：{path}；请设置 base_dir/--base-dir')
        from PIL import Image
        with Image.open(path) as image:
            image.verify()
        raw = self.get_starttag_text()
        # Consume whole attributes so src= inside a quoted alt/title cannot match.
        attributes = re.finditer(
            r'''([^\s=/>]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?''',
            raw[4:])  # skip <img
        matches = [match for match in attributes if match.group(1).lower() == 'src']
        if len(matches) != 1:
            raise ValueError('正文 img 的 src 属性格式无效')
        match = matches[0]
        row, column = self.getpos()
        self.images.append((self.offsets[row - 1] + column, raw,
                            (match.start() + 4, match.end() + 4), path))

    handle_startendtag = handle_starttag


def upload_inline_image(token, path):
    import requests
    path = Path(path)
    with open(path, 'rb') as image_file:
        result = _parse_json(requests.post(
            'https://api.weixin.qq.com/cgi-bin/media/uploadimg',
            params={'access_token': token},
            files={'media': (path.name, image_file, mimetypes.guess_type(path.name)[0] or 'application/octet-stream')},
            timeout=30))
    url = result.get('url', '')
    if (not isinstance(url, str) or urlsplit(url).scheme not in {'http', 'https'}
            or not urlsplit(url).netloc):
        raise RuntimeError(f'正文图片上传失败: {result}')
    return url


def _replace_images(token, html, images):
    uploaded = {}
    # Upload in reading order, reuse repeated local files, then replace backwards by offset.
    for _, _, _, path in images.images:
        if path not in uploaded:
            uploaded[path] = upload_inline_image(token, path)
    for offset, raw, (start, end), path in reversed(images.images):
        tag = raw[:start] + 'src="' + escape(uploaded[path], quote=True) + '"' + raw[end:]
        html = html[:offset] + tag + html[offset + len(raw):]
    return html


def upload_and_cleanup(cover_path, title, digest, html_content, *, base_dir=None):
    """
    完整流程：刷新 token → 压缩 HTML → 上传封面 → 创建草稿。
    返回 (media_id, nbsp_count)

    media_id：草稿的 media_id，可用于后续 update_draft 或直接发布
    nbsp_count：草稿内容中检测到的 &nbsp; 数量（应为 0）

    注意：微信草稿 API 不接受 0 长度的 thumb_media_id，
    所以 cover_path 不能省略；封面图请预先准备好。
    """
    if not html_content.strip():
        raise ValueError('正文不能为空')
    # Resolve every local image before any API request, so missing images do not create partial drafts.
    images = _Images(html_content, base_dir)
    token = get_token()

    # 压缩 HTML，防止手机端注入 &nbsp;
    html_minified = minify_html(_replace_images(token, html_content, images))

    # 上传封面
    thumb_id = upload_cover(token, cover_path)

    # 创建草稿
    media_id = create_draft(token, thumb_id, title, digest, html_minified)

    # 验证：取回草稿，检查内容里是否有 &nbsp;
    nbsp_count = verify_draft(token, media_id, title)
    print_status(f"✅ 草稿上传完成: media_id={media_id}, &nbsp;={nbsp_count}")
    return media_id, nbsp_count


def cleanup_draft_nbsp(token, media_id):
    """
    清理草稿里的 &nbsp; 和 &#160; 空白字符。
    用于：发现草稿里出现多余 nbsp 之后补救。
    """
    news = _get_article(token, media_id)
    content = news['content']
    original_nbsp = _nbsp_count(content)

    if original_nbsp == 0:
        print_status("草稿无 nbsp，无需清理")
        return media_id

    # 只清"连续 2 个及以上"的空白实体 —— 手机端注入的 nbsp 来自源码缩进，
    # 必然成串出现。单个 &nbsp; 通常是排版里刻意留的间隔
    # （如 <span leaf="">&nbsp;</span> 圆点分隔符、"&nbsp;·&nbsp;"），
    # 以前无差别全删会把这些正常间距一起抹掉、撑坏布局。
    cleaned = NBSP_RUN.sub('', content)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    removed = original_nbsp - _nbsp_count(cleaned)
    if removed == 0:
        print_status("未发现连串 nbsp（单个 nbsp 属正常排版间距，已保留）")
        return media_id

    update_draft(token, media_id, news.get('thumb_media_id', ''),
                 news['title'], news.get('digest', ''), cleaned, original_article=news)
    verify_draft(token, media_id, news['title'], expected_nbsp=_nbsp_count(cleaned))
    print_status(f"清理完成: 删除 {removed} 个连串空白符")
    return media_id


# ── 命令行入口 ─────────────────────────────────────────────────────────

def main():
    configure_stdio()
    parser = argparse.ArgumentParser(description="上传公众号草稿并回读验证（UTF-8 输入）")
    parser.add_argument('cover', nargs='?')
    parser.add_argument('title', nargs='?')
    parser.add_argument('digest', nargs='?')
    parser.add_argument('content', nargs='?', help='原样 HTML；省略时从 stdin 读取')
    parser.add_argument('--html-file', type=Path, help='从 UTF-8 HTML 文件读取正文')
    parser.add_argument('--base-dir', type=Path, help='相对图片的基准目录；默认 HTML 所在目录或当前目录')
    args = parser.parse_args()
    if args.html_file and args.content is not None:
        parser.error('--html-file 与正文参数不能同时使用')
    cover = args.cover or os.environ.get('WECHAT_COVER_PATH', 'image_001.jpg')
    title = args.title if args.title is not None else input('标题: ')
    digest = args.digest if args.digest is not None else input('摘要: ')
    try:
        content = (args.html_file.read_text(encoding='utf-8') if args.html_file else
                   args.content if args.content is not None else sys.stdin.read())
        base_dir = args.base_dir or (args.html_file.resolve().parent if args.html_file else Path.cwd())
        upload_and_cleanup(cover, title, digest, content, base_dir=base_dir)
    except DraftVerificationError as exc:
        # 草稿已经创建成功，只是回读验证没过——退出码 2，提示不要重复创建
        print_status(str(exc), file=sys.stderr)
        return 2
    except (OSError, ValueError, RuntimeError) as exc:
        # 其余失败（缺图、图片无法解析、token/封面上传失败等）给一行干净提示，
        # 不要向用户甩 traceback。故意不用裸 except Exception——那会把真实的
        # 编程错误（AttributeError/TypeError）也吞成"上传失败"，反而难排查。
        print_status(f"✗ 上传失败：{exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
