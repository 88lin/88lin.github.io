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
      html_content=open('article.html').read()
  )
"""

import sys, os, json, re, datetime

# 压缩逻辑只此一份（scripts/minify_gzh_html.py），不在这里复制实现——
# 两份拷贝必然漂移，之前就是这么把"换行被吃掉"的 bug 复制了两遍。
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from minify_gzh_html import minify_html  # noqa: E402

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


def get_token():
    """从本地缓存文件读取 access_token，过期前自动刷新。"""
    if not os.path.exists(TOKEN_FILE):
        return refresh_token()
    with open(TOKEN_FILE) as f:
        data = json.load(f)
    expires = datetime.datetime.fromisoformat(data.get('expires', '2000-01-01'))
    if datetime.datetime.now() >= expires - datetime.timedelta(minutes=5):
        return refresh_token()
    return data['access_token']


def refresh_token():
    """调用 stable_token 接口刷新 access_token，并缓存到本地文件。"""
    import requests
    with open(CONFIG_FILE) as f:
        cfg = json.load(f)
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
        raise Exception(f"Token 刷新失败: {result}")

    token = result['access_token']
    expires = datetime.datetime.now() + datetime.timedelta(seconds=result.get('expires_in', 7200))
    with open(TOKEN_FILE, 'w') as f:
        json.dump({'access_token': token, 'expires': expires.isoformat()}, f)
    return token


# ── 封面图上传 ─────────────────────────────────────────────────────────

def upload_cover(token, img_path):
    """
    压缩封面上传，返回 media_id（必须用 type=thumb）。
    压缩到 ≤64KB（微信限制），质量自适应。
    """
    from PIL import Image
    import requests as _req

    img = Image.open(img_path).convert('RGB')
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
        raise Exception(f"封面压缩后仍为 {size} 字节（>64KB），"
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
        raise Exception(f"封面上传失败: {result}")
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
        raise Exception(f"草稿创建失败: {result}")
    return result['media_id']


def update_draft(token, media_id, thumb_media_id, title, digest, content):
    """调用 draft/update 更新已有草稿。"""
    import requests as _req
    update_data = {
        "media_id": media_id,
        "index": 0,
        "articles": {
            "title": title,
            "digest": digest,
            "content": content,
            "content_source_url": "",
            "thumb_media_id": thumb_media_id,
            "need_open_comment": 1,
            "only_fans_can_comment": 0
        }
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
    if result.get('errcode') not in (None, 0):
        raise Exception(f"草稿更新失败: {result}")
    return media_id


# ── 一站式上传 ─────────────────────────────────────────────────────────

def upload_and_cleanup(cover_path, title, digest, html_content):
    """
    完整流程：刷新 token → 压缩 HTML → 上传封面 → 创建草稿。
    返回 (media_id, nbsp_count)

    media_id：草稿的 media_id，可用于后续 update_draft 或直接发布
    nbsp_count：草稿内容中检测到的 &nbsp; 数量（应为 0）

    注意：微信草稿 API 不接受 0 长度的 thumb_media_id，
    所以 cover_path 不能省略；封面图请预先准备好。
    """
    token = refresh_token()

    # 压缩 HTML，防止手机端注入 &nbsp;
    html_minified = minify_html(html_content)

    # 上传封面
    thumb_id = upload_cover(token, cover_path)

    # 创建草稿
    media_id = create_draft(token, thumb_id, title, digest, html_minified)

    # 验证：取回草稿，检查内容里是否有 &nbsp;
    import requests as _req
    url = f"https://api.weixin.qq.com/cgi-bin/draft/get?access_token={token}"
    r = _req.post(url, json={"media_id": media_id}, timeout=10)
    result = _parse_json(r)   # 不要用 r.json()，见 SKILL.md 第 6 步说明
    if 'news_item' not in result:
        print(f"[警告] 取回草稿验证失败: {result}")
        return media_id, 0

    content = result['news_item'][0]['content']
    nbsp_count = content.count('&nbsp;') + content.count('&#160;')
    print(f"✅ 草稿上传完成: media_id={media_id}, &nbsp;={nbsp_count}")
    return media_id, nbsp_count


def cleanup_draft_nbsp(token, media_id):
    """
    清理草稿里的 &nbsp; 和 &#160; 空白字符。
    用于：发现草稿里出现多余 nbsp 之后补救。
    """
    import requests as _req
    url = f"https://api.weixin.qq.com/cgi-bin/draft/get?access_token={token}"
    r = _req.post(url, json={"media_id": media_id}, timeout=10)
    result = _parse_json(r)
    if 'news_item' not in result:
        raise Exception(f"取回草稿失败: {result}")

    news = result['news_item'][0]
    content = news['content']
    original_nbsp = content.count('&nbsp;') + content.count('&#160;')

    if original_nbsp == 0:
        print("草稿无 nbsp，无需清理")
        return media_id

    # 只清"连续 2 个及以上"的空白实体 —— 手机端注入的 nbsp 来自源码缩进，
    # 必然成串出现。单个 &nbsp; 通常是排版里刻意留的间隔
    # （如 <span leaf="">&nbsp;</span> 圆点分隔符、"&nbsp;·&nbsp;"），
    # 以前无差别全删会把这些正常间距一起抹掉、撑坏布局。
    cleaned = re.sub(r'(?:&nbsp;|&#160;){2,}', '', content)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    removed = original_nbsp - (cleaned.count('&nbsp;') + cleaned.count('&#160;'))
    if removed == 0:
        print("未发现连串 nbsp（单个 nbsp 属正常排版间距，已保留）")
        return media_id

    update_draft(token, media_id, news.get('thumb_media_id', ''),
                 news['title'], news.get('digest', ''), cleaned)
    print(f"清理完成: 删除 {removed} 个连串空白符")
    return media_id


# ── 命令行入口 ─────────────────────────────────────────────────────────

def main():
    """
    用法：
      python3 wechat_draft.py [封面图] [标题] [摘要] [正文html]
      正文支持 \\n 分段，也可重定向：python3 wechat_draft.py cover.jpg "标题" "摘要" < article.html
    """
    import requests as _req
    cover_path = (sys.argv[1] if len(sys.argv) > 1
                  else os.environ.get('WECHAT_COVER_PATH', 'image_001.jpg'))
    title      = (sys.argv[2] if len(sys.argv) > 2 else input("标题: "))
    digest     = (sys.argv[3] if len(sys.argv) > 3 else input("摘要: "))
    # 注意：\n 转义替换必须对(argv/stdin)两个来源都生效，
    # 否则命令行直接传正文时 "\\n" 不会被还原成换行
    content    = sys.argv[4] if len(sys.argv) > 4 else sys.stdin.read()
    content    = content.replace('\\n', '\n')

    token   = get_token()
    thumb_id = upload_cover(token, cover_path)
    draft_id = create_draft(token, thumb_id, title, digest,
                            minify_html(content))
    print(f"草稿创建成功: {draft_id}")


if __name__ == '__main__':
    main()
