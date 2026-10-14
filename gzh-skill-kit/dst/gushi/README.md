# gushi

`gushi` 当前按静态页面部署。

## 实际上线文件

部署和访问只依赖下面这些文件：

- `dist/index.html`
- `dist/app.css`
- `dist/app.js`
- `dist/json/*`

首页入口链接保持为：

```html
<a class="resource-link" href="./gushi/dist/index.html" target="_blank" rel="noreferrer" data-keywords="古诗起名 起名 诗词">古诗起名</a>
```

## 目录说明

- `dist/`
  当前正式使用的静态成品，部署时以这里为准。
- `src/`
  源码备份，后续如果要修 bug 或小改样式，优先参考这里。
- `webpack.*` / `package*.json`
  历史构建配置。当前项目不依赖它们上线。

## 当前维护方式

- 现在不走 `npm run build`。
- 现在不需要 `node_modules`。
- 后续如果只是修 bug，可以直接修改 `dist/`，也可以先参考 `src/` 再同步修改到 `dist/`。

## 注意

旧的 webpack 构建链比较老，在当前 Node 环境下不保证可用，因此不要把它当成当前发布流程的一部分。
